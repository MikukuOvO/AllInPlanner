import React, { useState, useEffect } from 'react';
import MemoListModal from './MemoListModal'; // 引入新建的对话框组件

const MarkdownEditorComponent = ({ memos, setMemos, selectedMemo, setSelectedMemo }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [title, setTitle] = useState('');
  const [newMemoTitle, setNewMemoTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // 管理对话框的状态
  const [showAlert, setShowAlert] = useState(false); // 新增的状态来管理弹窗提醒
  const [isAddingNewMemo, setIsAddingNewMemo] = useState(false); // 跟踪是否正在添加新 memo

  useEffect(() => {
    if (selectedMemo) {
      setContent(selectedMemo.content || '');
      setTags(Array.isArray(selectedMemo.tags) ? selectedMemo.tags.join(', ') : '');
      setTitle(selectedMemo.title || '');
    }
  }, [selectedMemo]);

  const handleSave = async () => {
    const updatedMemo = {
      ...selectedMemo,
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim())
    };

    const method = selectedMemo ? 'PUT' : 'POST';
    const url = selectedMemo ? `http://127.0.0.1:5000/api/memos/${selectedMemo.id}` : 'http://127.0.0.1:5000/api/memos';

    // 向后端发送请求
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedMemo)
      });

      if (response.ok) {
        const result = await response.json();
        if (method === 'POST') {
          setMemos([...memos, result]);
          setSelectedMemo(result);
        } else {
          setMemos(memos.map(memo => (memo.id === updatedMemo.id ? updatedMemo : memo)));
        }
        console.log('Memo saved successfully:', result);
        setShowAlert(true); // 显示弹窗提醒
        setTimeout(() => setShowAlert(false), 3000); // 3秒后隐藏弹窗
      } else {
        console.error('Failed to save memo:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving memo:', error);
    }
  };

  const handleAddMemo = async () => {
    if (newMemoTitle.trim() !== "") {
      const newMemo = { id: Date.now().toString(), title: newMemoTitle, content: '', tags: [] };

      // 向后端发送 POST 请求以创建新 Memo
      try {
        const response = await fetch('http://127.0.0.1:5000/api/memos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newMemo)
        });

        if (response.ok) {
          const result = await response.json();
          setMemos([...memos, result]);
          setNewMemoTitle('');
          setSelectedMemo(result);
          setIsAddingNewMemo(false); // 隐藏新 memo 输入框和 Add 按钮
          console.log('Memo added successfully:', result);
        } else {
          console.error('Failed to add memo:', response.statusText);
        }
      } catch (error) {
        console.error('Error adding memo:', error);
      }
    }
  };

  const handleDeleteMemo = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/memos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMemos(memos.filter(memo => memo.id !== id));
        setSelectedMemo(null);
        console.log('Memo deleted successfully');
      } else {
        console.error('Failed to delete memo:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting memo:', error);
    }
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleTagsChange = (event) => {
    setTags(event.target.value);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen); // 切换对话框的显示状态
  };

  const startAddingMemo = () => {
    setIsAddingNewMemo(true); // 开始添加新 memo，显示输入框和 Add 按钮
  };

  return (
    <div>
      {showAlert && (
        <div className="alert">
          保存成功！
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Memo Editor</h2>
        <button onClick={toggleModal} style={{ padding: '5px 10px', marginRight: '10px', width: '150px' }}>Previous Memo</button>
      </div>
      {!isAddingNewMemo && (
        <button onClick={startAddingMemo}>Add New Memo</button>
      )}
      {isAddingNewMemo && (
        <>
          <input
            type="text"
            value={newMemoTitle}
            onChange={(e) => setNewMemoTitle(e.target.value)}
            placeholder="New memo title..."
          />
          <button onClick={handleAddMemo}>Add</button>
        </>
      )}
      <ul>
        {memos.slice(0, 5).map((memo) => (
          <li key={memo.id}>
            <span onClick={() => setSelectedMemo(memo)}>{memo.title}</span>
            <button onClick={() => handleDeleteMemo(memo.id)}>Delete</button>
          </li>
        ))}
        {memos.length > 5 && (
          <li className="more-option" onClick={toggleModal}>More...</li>
        )}
      </ul>
      {selectedMemo && (
        <>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Memo title..."
          />
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Write your memo here..."
            rows="10"
            style={{ width: '100%' }}
          />
          <input
            type="text"
            value={tags}
            onChange={handleTagsChange}
            placeholder="Tags (comma separated)..."
          />
          <button onClick={handleSave}>Save</button>
        </>
      )}
      {isModalOpen && <MemoListModal closeModal={toggleModal} setSelectedMemo={setSelectedMemo} />}
    </div>
  );
};

export default MarkdownEditorComponent;
