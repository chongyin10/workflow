import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Examples 应用入口
 * 
 * 用于 webpack.examples.config.js 配置的示例应用
 */

// 加载样式
import '../lib/styles/index.css';

// 创建根元素
const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
