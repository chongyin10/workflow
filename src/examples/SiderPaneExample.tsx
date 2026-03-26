import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Splitter, Table, Anchor, Button, Tag } from '@zjpcy/simple-design';
import {
  CodeEditor,
  Panel,
  PanelHeader,
  PanelContent,
  PanelToolbar,
} from './components/CodeEditor';
import './styles/panel.css';

// React 组件示例 - 用于 reactContent
const NodeList: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{
      padding: 12,
      background: '#f0f9ff',
      borderRadius: 8,
      border: '1px solid #bae6fd',
      cursor: 'pointer',
    }}>
      <div style={{ fontWeight: 500, color: '#0369a1' }}>开始节点</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>类型: StartNode</div>
    </div>
    <div style={{
      padding: 12,
      background: '#f0fdf4',
      borderRadius: 8,
      border: '1px solid #bbf7d0',
      cursor: 'pointer',
    }}>
      <div style={{ fontWeight: 500, color: '#15803d' }}>处理节点</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>类型: ProcessNode</div>
    </div>
    <div style={{
      padding: 12,
      background: '#fef2f2',
      borderRadius: 8,
      border: '1px solid #fecaca',
      cursor: 'pointer',
    }}>
      <div style={{ fontWeight: 500, color: '#b91c1c' }}>结束节点</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>类型: EndNode</div>
    </div>
  </div>
);

// React 组件示例 - 用于 reactHeader
const CustomHeader: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ fontSize: 18 }}>🚀</span>
    <span style={{ fontWeight: 600, color: '#1e293b' }}>React Header</span>
    <Tag color="blue" size="small">New</Tag>
  </div>
);

// SiderPane 配置表格
const siderPaneConfigColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const siderPaneConfigData = [
  { name: 'visible', type: 'boolean', default: 'true', description: '是否默认显示侧边栏' },
  { name: 'width', type: 'number', default: '280', description: '侧边栏初始宽度' },
  { name: 'minWidth', type: 'number', default: '200', description: '侧边栏最小宽度' },
  { name: 'maxWidth', type: 'number', default: '500', description: '侧边栏最大宽度' },
  { name: 'title', type: 'string', default: "'侧边栏'", description: '侧边栏标题' },
  { name: 'backgroundColor', type: 'string', default: "'#ffffff'", description: '侧边栏背景颜色' },
  { name: 'borderColor', type: 'string', default: "'#e5e7eb'", description: '侧边栏边框颜色' },
  { name: 'boxShadow', type: 'string', default: "'4px 0 16px rgba(0, 0, 0, 0.08)'", description: '侧边栏阴影' },
  { name: 'zIndex', type: 'number', default: '100', description: '侧边栏层级' },
  { name: 'resizable', type: 'boolean', default: 'true', description: '是否显示调整大小的手柄' },
  { name: 'resizeHandleWidth', type: 'number', default: '4', description: '调整大小手柄宽度' },
  { name: 'resizeHandleColor', type: 'string', default: "'transparent'", description: '调整大小手柄颜色' },
  { name: 'resizeHandleHoverColor', type: 'string', default: "'#3b82f6'", description: '调整大小手柄悬停颜色' },
  { name: 'toggleButtonColor', type: 'string', default: "'#64748b'", description: '展开/收起按钮颜色' },
  { name: 'toggleButtonHoverColor', type: 'string', default: "'#3b82f6'", description: '展开/收起按钮悬停颜色' },
  { name: 'toggleButtonBg', type: 'string', default: "'#ffffff'", description: '展开/收起按钮背景色' },
  { name: 'toggleButtonHoverBg', type: 'string', default: "'#f1f5f9'", description: '展开/收起按钮悬停背景色' },
  { name: 'renderContent', type: '(container) => void', default: '-', description: '自定义内容渲染函数' },
  { name: 'renderHeader', type: '(container) => void', default: '-', description: '自定义头部渲染函数' },
  { name: 'onResize', type: '(width) => void', default: '-', description: '宽度变化回调' },
  { name: 'onToggle', type: '(visible) => void', default: '-', description: '显示/隐藏状态变化回调' },
];

// 示例 1: 基础侧边栏
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建基础侧边栏插件
const siderPane = new SiderPane({
  title: '节点列表',
  width: 250,
  minWidth: 180,
  maxWidth: 400,
  visible: true,
  renderContent: (contentContainer) => {
    // 创建节点列表内容
    contentContainer.innerHTML = \`
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.borderColor='#3b82f6';this.style.background='#eff6ff'"
           onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#f8fafc'">
          <div style="font-weight: 500; color: #1e293b;">开始节点</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">类型: StartNode</div>
        </div>
        <div style="
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.borderColor='#3b82f6';this.style.background='#eff6ff'"
           onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#f8fafc'">
          <div style="font-weight: 500; color: #1e293b;">处理节点</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">类型: ProcessNode</div>
        </div>
        <div style="
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.borderColor='#3b82f6';this.style.background='#eff6ff'"
           onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#f8fafc'">
          <div style="font-weight: 500; color: #1e293b;">结束节点</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">类型: EndNode</div>
        </div>
      </div>
    \`;
  },
});

// 安装插件
graph.use(siderPane);

// 创建演示节点
graph.addNode({
  id: 'node-1',
  label: '开始',
  x: 350,
  y: 180,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#166534',
    borderRadius: 25,
    borderWidth: 2,
  },
});

console.log('✅ 基础侧边栏示例');
console.log('   左侧侧边栏显示节点列表');
console.log('   支持拖拽调整宽度');
console.log('   点击顶部关闭按钮隐藏侧边栏');`;

// 示例 2: 带回调函数的侧边栏
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建侧边栏，添加回调函数
const siderPane = new SiderPane({
  title: '属性面板',
  width: 300,
  minWidth: 200,
  maxWidth: 450,
  visible: true,
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
  resizeHandleHoverColor: '#8b5cf6',
  toggleButtonHoverColor: '#8b5cf6',
  onResize: (width) => {
    console.log('📐 侧边栏宽度变化:', width + 'px');
  },
  onToggle: (visible) => {
    console.log('👁️ 侧边栏状态:', visible ? '显示' : '隐藏');
  },
  renderContent: (contentContainer) => {
    contentContainer.innerHTML = \`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="padding: 16px; background: #f5f3ff; border-radius: 8px; border: 1px solid #ddd6fe;">
          <h4 style="margin: 0 0 8px 0; color: #7c3aed; font-size: 14px;">回调函数演示</h4>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">调整侧边栏宽度或显示/隐藏时，查看控制台输出</p>
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #374151; margin-bottom: 6px; font-weight: 500;">
            节点名称
          </label>
          <input type="text" value="示例节点" readonly
            style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; box-sizing: border-box; background: #f9fafb;">
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #374151; margin-bottom: 6px; font-weight: 500;">
            节点类型
          </label>
          <select disabled
            style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; box-sizing: border-box; background: #f9fafb;">
            <option>矩形节点</option>
            <option>圆形节点</option>
            <option>菱形节点</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #374151; margin-bottom: 6px; font-weight: 500;">
            描述
          </label>
          <textarea readonly rows="3"
            style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; box-sizing: border-box; resize: vertical; background: #f9fafb; font-family: inherit;">这是一个示例节点，用于演示侧边栏插件的功能。</textarea>
        </div>
      </div>
    \`;
  },
});

graph.use(siderPane);

// 创建示例节点
graph.addNode({
  id: 'node-1',
  label: '示例节点',
  x: 350,
  y: 200,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#f5f3ff',
    borderColor: '#8b5cf6',
    textColor: '#5b21b6',
    borderRadius: 8,
    borderWidth: 2,
  },
});

console.log('🎮 带回调函数的侧边栏');
console.log('   - 拖拽调整宽度查看 onResize 回调');
console.log('   - 点击关闭/展开按钮查看 onToggle 回调');`;

// 示例 3: 自定义样式侧边栏
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建自定义样式侧边栏
const siderPane = new SiderPane({
  title: '🎨 样式定制',
  width: 280,
  visible: true,
  backgroundColor: '#0f172a',
  borderColor: '#334155',
  boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
  resizeHandleColor: '#475569',
  resizeHandleHoverColor: '#3b82f6',
  toggleButtonColor: '#94a3b8',
  toggleButtonHoverColor: '#ffffff',
  toggleButtonBg: '#1e293b',
  toggleButtonHoverBg: '#334155',
  renderContent: (contentContainer) => {
    contentContainer.innerHTML = \`
      <div style="display: flex; flex-direction: column; gap: 12px; color: #e2e8f0;">
        <div style="
          padding: 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 12px;
          color: white;
        ">
          <h4 style="margin: 0 0 8px 0; font-size: 14px;">深色主题</h4>
          <p style="margin: 0; font-size: 12px; opacity: 0.9;">使用自定义颜色和背景</p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <div style="
            width: 40px;
            height: 40px;
            background: #ef4444;
            border-radius: 8px;
            cursor: pointer;
          "></div>
          <div style="
            width: 40px;
            height: 40px;
            background: #f59e0b;
            border-radius: 8px;
            cursor: pointer;
          "></div>
          <div style="
            width: 40px;
            height: 40px;
            background: #10b981;
            border-radius: 8px;
            cursor: pointer;
          "></div>
          <div style="
            width: 40px;
            height: 40px;
            background: #3b82f6;
            border-radius: 8px;
            cursor: pointer;
          "></div>
          <div style="
            width: 40px;
            height: 40px;
            background: #8b5cf6;
            border-radius: 8px;
            cursor: pointer;
          "></div>
        </div>
        <div style="padding: 12px; background: #1e293b; border-radius: 8px; border: 1px solid #334155;">
          <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">样式设置</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
              <input type="checkbox" checked disabled style="accent-color: #3b82f6;">
              <span>显示边框</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
              <input type="checkbox" checked disabled style="accent-color: #3b82f6;">
              <span>显示阴影</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
              <input type="checkbox" disabled style="accent-color: #3b82f6;">
              <span>圆角效果</span>
            </label>
          </div>
        </div>
      </div>
    \`;
  },
});

graph.use(siderPane);

// 创建示例节点
const colors = [
  { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
];

colors.forEach((color, i) => {
  graph.addNode({
    id: 'style-node-' + (i + 1),
    label: '样式 ' + (i + 1),
    x: 320 + i * 80,
    y: 200,
    style: {
      width: 70,
      height: 70,
      backgroundColor: color.bg,
      borderColor: color.border,
      textColor: color.text,
      borderRadius: 8,
      borderWidth: 2,
    },
  });
});

console.log('🎨 自定义样式侧边栏');
console.log('   深色主题风格');
console.log('   自定义颜色和阴影效果');`;

// 示例 4: 动态控制侧边栏
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建侧边栏
const siderPane = new SiderPane({
  title: '控制面板',
  width: 260,
  visible: true,
  onToggle: (visible) => {
    console.log('侧边栏状态:', visible ? '显示' : '隐藏');
  },
  renderContent: (contentContainer) => {
    contentContainer.innerHTML = \`
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="padding: 12px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0;">
          <h4 style="margin: 0 0 8px 0; color: #059669; font-size: 14px;">API 控制演示</h4>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">使用控制台调用 API 控制侧边栏</p>
        </div>
        <div style="font-size: 13px; color: #374151; line-height: 1.6;">
          <p style="margin: 0 0 8px 0;"><strong>可用方法：</strong></p>
          <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">siderPane.show()</code><br>
          <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">siderPane.hide()</code><br>
          <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">siderPane.toggle()</code><br>
          <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">siderPane.setWidth(300)</code><br>
          <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">siderPane.getWidth()</code><br>
          <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">siderPane.getVisible()</code>
        </div>
      </div>
    \`;
  },
});

graph.use(siderPane);

// 将 siderPane 暴露到全局，方便在控制台测试
window.siderPane = siderPane;

// 创建示例节点
graph.addNode({
  id: 'control-node',
  label: 'API 测试',
  x: 450,
  y: 200,
  style: {
    width: 140,
    height: 60,
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
    borderRadius: 8,
    borderWidth: 2,
  },
});

console.log('🎮 动态控制侧边栏');
console.log('   siderPane 已暴露到全局 window 对象');
console.log('');
console.log('   试试在控制台执行：');
console.log('   - siderPane.hide()');
console.log('   - siderPane.show()');
console.log('   - siderPane.toggle()');
console.log('   - siderPane.setWidth(350)');
console.log('   - siderPane.getWidth()');
console.log('   - siderPane.getVisible()');`;

// 示例 5: React 语法糖 - 使用 reactContent 和 reactHeader
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 定义 React 组件（可以在 SiderPane 外部定义）
const NodeList = () => {
  const items = [
    { name: '开始节点', type: 'StartNode', color: '#0ea5e9', bg: '#f0f9ff' },
    { name: '处理节点', type: 'ProcessNode', color: '#22c55e', bg: '#f0fdf4' },
    { name: '结束节点', type: 'EndNode', color: '#ef4444', bg: '#fef2f2' },
  ];
  
  return React.createElement('div', {
    style: { display: 'flex', flexDirection: 'column', gap: 12 }
  }, items.map((item, i) =>
    React.createElement('div', {
      key: i,
      style: {
        padding: 12,
        background: item.bg,
        borderRadius: 8,
        border: \`1px solid \${item.color}30\`,
        cursor: 'pointer',
      }
    }, [
      React.createElement('div', {
        key: 'name',
        style: { fontWeight: 500, color: item.color }
      }, item.name),
      React.createElement('div', {
        key: 'type',
        style: { fontSize: 12, color: '#64748b', marginTop: 4 }
      }, '类型: ' + item.type)
    ])
  ));
};

const CustomHeader = () =>
  React.createElement('div', {
    style: { display: 'flex', alignItems: 'center', gap: 8 }
  }, [
    React.createElement('span', { key: 'icon', style: { fontSize: 18 } }, '🚀'),
    React.createElement('span', {
      key: 'title',
      style: { fontWeight: 600, color: '#1e293b' }
    }, 'React Header')
  ]);

// 创建侧边栏 - 使用 reactContent 语法糖
const siderPane = new SiderPane({
  title: 'React 内容',
  width: 260,
  visible: true,
  // 使用 reactContent 语法糖，无需手动操作 DOM
  reactContent: React.createElement(NodeList),
  // 也可以使用 reactHeader 自定义头部
  reactHeader: React.createElement(CustomHeader),
});

graph.use(siderPane);

// 创建示例节点
graph.addNode({
  id: 'react-node',
  label: 'React',
  x: 350,
  y: 200,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
    borderRadius: 8,
    borderWidth: 2,
  },
});

console.log('⚛️ React 语法糖示例');
console.log('   - 使用 reactContent 替代 renderContent');
console.log('   - 使用 reactHeader 替代 renderHeader');
console.log('   - 无需手动操作 DOM，直接传入 React 元素');`;

// 示例 6: 工具箱侧边栏
const EXAMPLE_6_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建工具箱侧边栏
const siderPane = new SiderPane({
  title: '🧰 工具箱',
  width: 240,
  minWidth: 180,
  maxWidth: 350,
  visible: true,
  backgroundColor: '#ffffff',
  borderColor: '#e2e8f0',
  boxShadow: '2px 0 12px rgba(0, 0, 0, 0.06)',
  renderContent: (contentContainer) => {
    const tools = [
      { name: '矩形', icon: '▭', color: '#3b82f6' },
      { name: '圆形', icon: '○', color: '#10b981' },
      { name: '菱形', icon: '◇', color: '#f59e0b' },
      { name: '文本', icon: 'T', color: '#8b5cf6' },
      { name: '图片', icon: '🖼️', color: '#ec4899' },
      { name: '连接线', icon: '—', color: '#64748b' },
    ];
    
    contentContainer.innerHTML = \`
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 500;">
          拖拽工具到画布
        </div>
        \${tools.map(tool => \`
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            cursor: grab;
            transition: all 0.2s;
          " 
          onmouseover="this.style.borderColor='\${tool.color}';this.style.background='#eff6ff';this.style.transform='translateX(4px)'"
          onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#f8fafc';this.style.transform='translateX(0)'"
          onmousedown="this.style.cursor='grabbing'"
          onmouseup="this.style.cursor='grab'">
            <span style="
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: \${tool.color}15;
              border-radius: 8px;
              font-size: 16px;
              color: \${tool.color};
            ">\${tool.icon}</span>
            <span style="font-size: 14px; color: #334155; font-weight: 500;">\${tool.name}</span>
          </div>
        \`).join('')}
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <div style="font-size: 12px; color: #94a3b8; text-align: center;">
            共 \${tools.length} 个工具
          </div>
        </div>
      </div>
    \`;
  },
});

graph.use(siderPane);

// 创建一些示例节点
graph.addNode({
  id: 'tool-1',
  label: '开始',
  x: 350,
  y: 120,
  style: {
    width: 100,
    height: 40,
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
    borderRadius: 4,
    borderWidth: 1.5,
  },
});

graph.addNode({
  id: 'tool-2',
  label: '处理',
  x: 350,
  y: 200,
  style: {
    width: 100,
    height: 100,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
    borderRadius: 4,
    borderWidth: 1.5,
  },
});

graph.addNode({
  id: 'tool-3',
  label: '结束',
  x: 350,
  y: 320,
  style: {
    width: 100,
    height: 40,
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#166534',
    borderRadius: 20,
    borderWidth: 1.5,
  },
});

console.log('🧰 工具箱侧边栏');
console.log('   可拖拽的工具列表');
console.log('   响应式交互效果');`;

// 示例 7: 拖拽节点到画布（结合 Dnd 插件）
const EXAMPLE_7_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建 Dnd 拖拽插件
const dnd = new Dnd({
  enabled: true,
  onDragStart: (e) => {
    console.log('📦 开始拖拽:', e.nodeOptions?.label);
  },
  onDrop: (e) => {
    console.log('✅ 放置节点:', e.nodeOptions?.label, '位置:', e.position);
    return true;
  },
});

graph.use(dnd);

// 节点类型定义 - 包含所有支持的形状类型
const nodeTypes = [
  {
    name: '矩形节点',
    type: 'RectNode',
    icon: '▭',
    color: '#3b82f6',
    bg: '#dbeafe',
    shape: { type: 'rect' },
    width: 120,
    height: 60,
    borderRadius: 4,
  },
  {
    name: '圆角矩形',
    type: 'RoundedRect',
    icon: '▢',
    color: '#8b5cf6',
    bg: '#f3e8ff',
    shape: { type: 'rect' },
    width: 120,
    height: 60,
    borderRadius: 12,
  },
  {
    name: '圆形节点',
    type: 'CircleNode',
    icon: '○',
    color: '#10b981',
    bg: '#d1fae5',
    shape: { type: 'circle' },
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  {
    name: '椭圆节点',
    type: 'EllipseNode',
    icon: '⬭',
    color: '#f59e0b',
    bg: '#fef3c7',
    shape: { type: 'ellipse' },
    width: 100,
    height: 60,
    borderRadius: 50,
  },
  {
    name: '菱形节点',
    type: 'DiamondNode',
    icon: '◇',
    color: '#ef4444',
    bg: '#fee2e2',
    shape: { type: 'polygon', points: [{x:0,y:-40}, {x:60,y:0}, {x:0,y:40}, {x:-60,y:0}] },
    width: 120,
    height: 80,
    borderRadius: 0,
  },
  {
    name: '六边形节点',
    type: 'HexagonNode',
    icon: '⬡',
    color: '#06b6d4',
    bg: '#cffafe',
    shape: { type: 'polygon', points: [{x:-30,y:-52}, {x:30,y:-52}, {x:60,y:0}, {x:30,y:52}, {x:-30,y:52}, {x:-60,y:0}] },
    width: 120,
    height: 104,
    borderRadius: 0,
  },
  {
    name: '三角形节点',
    type: 'TriangleNode',
    icon: '△',
    color: '#ec4899',
    bg: '#fce7f3',
    shape: { type: 'polygon', points: [{x:0,y:-40}, {x:50,y:40}, {x:-50,y:40}] },
    width: 100,
    height: 80,
    borderRadius: 0,
  },
  {
    name: '图片节点',
    type: 'ImageNode',
    icon: '🖼️',
    color: '#6366f1',
    bg: '#e0e7ff',
    shape: { type: 'image', src: 'https://picsum.photos/seed/node/100/100' },
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  {
    name: 'HTML节点',
    type: 'HTMLNode',
    icon: '🌐',
    color: '#14b8a6',
    bg: '#ccfbf1',
    shape: { type: 'html', html: '<div style="padding:8px;background:linear-gradient(135deg,#14b8a6,#0d9488);color:white;border-radius:6px;font-size:12px;text-align:center;">HTML<br>内容</div>' },
    width: 100,
    height: 60,
    borderRadius: 6,
  },
  {
    name: '开始节点',
    type: 'StartNode',
    icon: '▶',
    color: '#22c55e',
    bg: '#dcfce7',
    shape: { type: 'rect' },
    width: 100,
    height: 40,
    borderRadius: 20,
  },
  {
    name: '结束节点',
    type: 'EndNode',
    icon: '■',
    color: '#dc2626',
    bg: '#fecaca',
    shape: { type: 'rect' },
    width: 100,
    height: 40,
    borderRadius: 20,
  },
  {
    name: '判断节点',
    type: 'DecisionNode',
    icon: '◆',
    color: '#f97316',
    bg: '#ffedd5',
    shape: { type: 'polygon', points: [{x:0,y:-35}, {x:70,y:0}, {x:0,y:35}, {x:-70,y:0}] },
    width: 140,
    height: 70,
    borderRadius: 0,
  },
];

// 创建侧边栏
const siderPane = new SiderPane({
  title: '🎯 拖拽节点库',
  width: 260,
  minWidth: 200,
  maxWidth: 350,
  visible: true,
  backgroundColor: '#ffffff',
  borderColor: '#e2e8f0',
  boxShadow: '2px 0 16px rgba(0, 0, 0, 0.08)',
  resizeHandleHoverColor: '#3b82f6',
  renderContent: (contentContainer) => {
    // 创建节点列表容器
    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px; padding: 4px;';
    
    // 添加分组标题
    const groupTitle = document.createElement('div');
    groupTitle.textContent = '基础形状';
    groupTitle.style.cssText = 'font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; margin-top: 8px;';
    listContainer.appendChild(groupTitle);
    
    nodeTypes.forEach((nodeType, index) => {
      // 添加分组分隔
      if (index === 4) {
        const advancedTitle = document.createElement('div');
        advancedTitle.textContent = '高级形状';
        advancedTitle.style.cssText = 'font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; margin-top: 12px;';
        listContainer.appendChild(advancedTitle);
      }
      if (index === 9) {
        const flowTitle = document.createElement('div');
        flowTitle.textContent = '流程节点';
        flowTitle.style.cssText = 'font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; margin-top: 12px;';
        listContainer.appendChild(flowTitle);
      }
      
      // 创建节点项
      const nodeItem = document.createElement('div');
      nodeItem.className = 'dnd-node-item';
      nodeItem.style.cssText = \`
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: \${nodeType.bg};
        border-radius: 8px;
        border: 2px solid transparent;
        cursor: grab;
        transition: all 0.2s ease;
        user-select: none;
      \`;
      
      // 悬停效果
      nodeItem.addEventListener('mouseenter', () => {
        nodeItem.style.borderColor = nodeType.color;
        nodeItem.style.transform = 'translateX(4px)';
        nodeItem.style.boxShadow = \`0 2px 8px \${nodeType.color}30\`;
      });
      nodeItem.addEventListener('mouseleave', () => {
        nodeItem.style.borderColor = 'transparent';
        nodeItem.style.transform = 'translateX(0)';
        nodeItem.style.boxShadow = 'none';
      });
      nodeItem.addEventListener('mousedown', () => {
        nodeItem.style.cursor = 'grabbing';
      });
      nodeItem.addEventListener('mouseup', () => {
        nodeItem.style.cursor = 'grab';
      });
      
      // 图标
      const icon = document.createElement('span');
      icon.textContent = nodeType.icon;
      icon.style.cssText = \`
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: \${nodeType.color}20;
        border-radius: 8px;
        font-size: 18px;
        color: \${nodeType.color};
        flex-shrink: 0;
      \`;
      
      // 文本信息
      const info = document.createElement('div');
      info.style.cssText = 'flex: 1; min-width: 0;';
      
      const name = document.createElement('div');
      name.textContent = nodeType.name;
      name.style.cssText = 'font-size: 13px; font-weight: 500; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
      
      const type = document.createElement('div');
      type.textContent = nodeType.type;
      type.style.cssText = 'font-size: 11px; color: #64748b; margin-top: 2px;';
      
      info.appendChild(name);
      info.appendChild(type);
      
      nodeItem.appendChild(icon);
      nodeItem.appendChild(info);
      listContainer.appendChild(nodeItem);
      
      // 注册为拖拽源
      dnd.registerSource(nodeItem, {
        label: nodeType.name,
        x: 0,
        y: 0,
        style: {
          width: nodeType.width,
          height: nodeType.height,
          backgroundColor: nodeType.bg,
          borderColor: nodeType.color,
          borderWidth: 2,
          borderRadius: nodeType.borderRadius,
          textColor: nodeType.color,
          fontSize: 12,
          shape: nodeType.shape,
        },
      });
    });
    
    // 添加提示信息
    const hint = document.createElement('div');
    hint.innerHTML = '💡 <strong>提示：</strong>拖拽节点到画布上放置';
    hint.style.cssText = 'margin-top: 16px; padding: 12px; background: #f1f5f9; border-radius: 8px; font-size: 12px; color: #475569; line-height: 1.5;';
    listContainer.appendChild(hint);
    
    contentContainer.appendChild(listContainer);
  },
});

graph.use(siderPane);

// 添加一些示例节点作为参考
const sampleNodes = [
  { label: '示例:矩形', x: 400, y: 100, bg: '#dbeafe', border: '#3b82f6', radius: 4 },
  { label: '示例:圆形', x: 550, y: 100, bg: '#d1fae5', border: '#10b981', radius: 50 },
  { label: '示例:菱形', x: 400, y: 250, bg: '#fee2e2', border: '#ef4444', radius: 0 },
  { label: '示例:圆角', x: 550, y: 250, bg: '#f3e8ff', border: '#8b5cf6', radius: 12 },
];

sampleNodes.forEach((sample, i) => {
  graph.addNode({
    id: 'sample-' + i,
    label: sample.label,
    x: sample.x,
    y: sample.y,
    style: {
      width: 100,
      height: 50,
      backgroundColor: sample.bg,
      borderColor: sample.border,
      borderWidth: 2,
      borderRadius: sample.radius,
      textColor: sample.border,
    },
  });
});

console.log('🎯 拖拽节点库侧边栏');
console.log('   支持 12 种节点类型：');
console.log('   - 基础形状: 矩形、圆角矩形、圆形、椭圆');
console.log('   - 多边形: 菱形、六边形、三角形');
console.log('   - 特殊节点: 图片、HTML');
console.log('   - 流程节点: 开始、结束、判断');
console.log('   拖拽节点到画布上即可创建');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础侧边栏', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '回调函数', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '自定义样式', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '动态控制', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: 'React 语法糖', code: EXAMPLE_5_CODE },
  { id: 'example-6', title: '工具箱', code: EXAMPLE_6_CODE },
  { id: 'example-7', title: '拖拽节点', code: EXAMPLE_7_CODE },
];

export const SiderPaneExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph } = await import('../core');
      const { SiderPane, Dnd } = await import('../plugins');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        SiderPane,
        Dnd,
        React,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, SiderPane, Dnd, React } = sandbox;
        ${codeToExecute}
      `;

      const fn = new Function('sandbox', executableCode);
      fn(sandbox);
    } catch (error) {
      console.error('代码执行错误:', error);
    }
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    codeRef.current = newCode;
  }, []);

  const handleRunCode = useCallback(() => {
    executeCode(codeRef.current);
  }, [executeCode]);

  const handleResetCode = useCallback(() => {
    const code = EXAMPLES[currentExample].code;
    codeRef.current = code;
    setEditorKey((prev) => prev + 1);
    executeCode(code);
  }, [currentExample, executeCode]);

  const switchExample = useCallback(
    (index: number) => {
      setCurrentExample(index);
      const code = EXAMPLES[index].code;
      codeRef.current = code;
      setEditorKey((prev) => prev + 1);
      executeCode(code);
    },
    [executeCode]
  );

  useEffect(() => {
    executeCode(EXAMPLE_1_CODE);
  }, [executeCode]);

  const LeftPanel = (
    <Panel>
      <PanelHeader icon="📐" title="侧边栏演示" hint="点击展开/收起按钮体验侧边栏功能" />
      <div
        ref={graphContainerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          background: '#f8fafc',
        }}
      />
    </Panel>
  );

  const RightPanel = (
    <Panel>
      <PanelHeader icon="💻" title="代码编辑" />
      <PanelContent>
        <CodeEditor
          key={editorKey}
          value={EXAMPLES[currentExample].code}
          onUpdate={handleCodeChange}
          language="tsx"
        />
      </PanelContent>
      <PanelToolbar>
        <Button onClick={handleResetCode}>重置</Button>
        <Button type="primary" onClick={handleRunCode}>
          ▶ 运行代码
        </Button>
      </PanelToolbar>
    </Panel>
  );

  const BottomPanel = (
    <Panel>
      <PanelHeader icon="📋" title="API 文档" />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div id="siderpane-config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            SiderPane 配置选项
          </h3>
          <Table columns={siderPaneConfigColumns} dataSource={siderPaneConfigData} pagination={false} />
        </div>
        <div id="siderpane-api-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            API 方法
          </h3>
          <Table
            columns={[
              { title: '方法名', dataIndex: 'method', width: 250 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={[
              { method: 'graph.use(siderPane)', description: '安装侧边栏插件到 Graph 实例' },
              { method: 'siderPane.show()', description: '显示侧边栏' },
              { method: 'siderPane.hide()', description: '隐藏侧边栏' },
              { method: 'siderPane.toggle()', description: '切换侧边栏显示/隐藏状态' },
              { method: 'siderPane.getVisible()', description: '获取侧边栏当前可见状态' },
              { method: 'siderPane.getWidth()', description: '获取侧边栏当前宽度' },
              { method: 'siderPane.setWidth(width)', description: '设置侧边栏宽度' },
              { method: 'siderPane.getContentElement()', description: '获取内容容器 DOM 元素' },
              { method: 'siderPane.getHeaderElement()', description: '获取头部容器 DOM 元素' },
              { method: 'siderPane.updateContent(renderFn)', description: '更新侧边栏内容' },
            ]}
            pagination={false}
          />
        </div>
        <div id="siderpane-usage-tips" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>尺寸限制：</strong>minWidth 和 maxWidth 可以限制侧边栏的调整范围</li>
            <li><strong>自定义渲染：</strong>使用 renderContent 和 renderHeader 自定义内容</li>
            <li><strong>回调监听：</strong>onResize 和 onToggle 可以监听状态变化</li>
            <li><strong>样式定制：</strong>支持自定义背景色、边框、阴影等样式属性</li>
            <li><strong>动态更新：</strong>使用 updateContent 方法可以动态更新侧边栏内容</li>
            <li><strong>关闭后展开：</strong>侧边栏关闭后会在左上角显示展开按钮</li>
          </ul>
        </div>
        <div id="siderpane-dnd-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>拖拽节点到画布</h3>
          <p style={{ lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
            SiderPane 可以与 Dnd 插件结合使用，实现从侧边栏拖拽节点到画布的功能：
          </p>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>支持的节点类型：</strong>矩形、圆角矩形、圆形、椭圆、菱形、六边形、三角形、图片、HTML</li>
            <li><strong>流程节点：</strong>开始节点、结束节点、判断节点</li>
            <li><strong>使用方法：</strong>在 renderContent 中创建 DOM 元素，使用 dnd.registerSource 注册为拖拽源</li>
            <li><strong>自定义形状：</strong>通过 shape 配置可以指定节点的几何形状</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '600px' }}>
        <PanelHeader title="SiderPane 侧边栏插件示例" />
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 16px',
            background: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {EXAMPLES.map((ex, index) => (
            <button
              key={ex.id}
              onClick={() => switchExample(index)}
              style={{
                padding: '6px 16px',
                background: currentExample === index ? '#3b82f6' : '#ffffff',
                color: currentExample === index ? '#ffffff' : '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              示例 {index + 1}: {ex.title}
            </button>
          ))}
        </div>
        <Splitter style={{ height: '100%' }}>
          {LeftPanel}
          {RightPanel}
        </Splitter>
      </div>
      {BottomPanel}
      <div
        style={{
          position: 'fixed',
          right: '16px',
          top: '20%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Anchor affix={false} getContainer={() => document.body}>
          <Anchor.Link href="#siderpane-example-title" title="SiderPane 侧边栏示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#siderpane-config-section" title="配置选项" />
          <Anchor.Link href="#siderpane-api-section" title="API 方法" />
          <Anchor.Link href="#siderpane-usage-tips" title="使用提示" />
          <Anchor.Link href="#siderpane-dnd-section" title="拖拽节点" />
        </Anchor>
      </div>
    </div>
  );
};

export default SiderPaneExample;