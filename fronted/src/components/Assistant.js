// src/components/Astronaut.js
import React from 'react';
import { Link } from 'react-router-dom';

function Assistant() {
    return (
        <Link to="http://localhost:3003/llm">
            <div className="assistant">
                <img src="/assets/Assistant.png" alt="Assistant" />
                <p color='white'>Assistant</p>
            </div>
        </Link>
    );
}

export default Assistant;
