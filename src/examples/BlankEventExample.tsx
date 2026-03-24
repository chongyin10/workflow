import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Splitter, Table, Anchor, Button } from '@zjpcy/simple-design';
import {
  CodeEditor,
  Panel,
  PanelHeader,
  PanelContent,
  PanelToolbar,
} from './components/CodeEditor';
import './styles/panel.css';

// 可用事件表格数据
const eventColumns = [
  { title: '事件名称', dataIndex: 'name', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const eventData = [
  { name: 'blank:click', description: '在画布空白区域点击时触发' },
  { name: 'blank:contextmenu', description: '在画布空白区域右键时触发' },
];

// 示例 1: 基础空白事件
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建日志显示区域
const logContainer = document.createElement('div');
logContainer.style.cssText = 'position:absolute;bottom:8px;left:8px;right:8px;height:100px;background:#1e293b;color:#e2e8f0;padding:8px;borderRadius:6px;overflow:auto;fontSize:12px;fontFamily:monospace;';
container.appendChild(logContainer);

const addLog = (msg) => {
  const line = document.createElement('div');
  line.textContent = \`[\${new Date().toLocaleTimeString()}] \${msg}\`;
  logContainer.appendChild(line);
  logContainer.scrollTop = logContainer.scrollHeight;
  // 限制日志数量
  while (logContainer.children.length > 20) {
    logContainer.removeChild(logContainer.firstChild);
  }
};

// 添加示例节点
const node1 = graph.addNode({
  id: 'node-1',
  label: '节点 1',
  x: 150,
  y: 150,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

const node2 = graph.addNode({
  id: 'node-2',
  label: '节点 2',
  x: 400,
  y: 200,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

// 监听空白区域点击事件
graph.on('blank:click', (e) => {
  addLog(\`👆 空白区域点击: (\${Math.round(e.x)}, \${Math.round(e.y)})\`);
});

// 监听空白区域右键事件
graph.on('blank:contextmenu', (e) => {
  e.preventDefault?.();
  addLog(\`🖱️ 空白区域右键: (\${Math.round(e.x)}, \${Math.round(e.y)})\`);
});

addLog('空白区域事件监听已启动...');
addLog('提示：在节点上操作不会触发 blank 事件');`;

// 示例 2: 事件与节点交互
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 创建日志显示区域
const logContainer = document.createElement('div');
logContainer.style.cssText = 'position:absolute;bottom:8px;left:8px;right:8px;height:100px;background:#1e293b;color:#e2e8f0;padding:8px;borderRadius:6px;overflow:auto;fontSize:12px;fontFamily:monospace;';
container.appendChild(logContainer);

const addLog = (msg) => {
  const line = document.createElement('div');
  line.textContent = \`[\${new Date().toLocaleTimeString()}] \${msg}\`;
  logContainer.appendChild(line);
  logContainer.scrollTop = logContainer.scrollHeight;
  while (logContainer.children.length > 20) {
    logContainer.removeChild(logContainer.firstChild);
  }
};

// 添加多个示例节点
const nodes = [
  { id: 'node-1', label: 'A', x: 100, y: 100, color: '#3b82f6' },
  { id: 'node-2', label: 'B', x: 300, y: 100, color: '#22c55e' },
  { id: 'node-3', label: 'C', x: 500, y: 100, color: '#f59e0b' },
];

nodes.forEach((n) => {
  graph.addNode({
    id: n.id,
    label: n.label,
    x: n.x,
    y: n.y,
    style: {
      width: 80,
      height: 60,
      backgroundColor: n.color,
      borderColor: n.color,
      textColor: '#ffffff',
    },
  });
});

// 空白区域点击 - 取消选中
graph.on('blank:click', (e) => {
  addLog('👆 空白区域点击 - 取消所有选中');
  // 如果有选中的节点，可以在这里取消选中
});

// 空白区域右键 - 显示上下文菜单
graph.on('blank:contextmenu', (e) => {
  e.preventDefault?.();
  addLog(\`🖱️ 空白区域右键菜单 @ (\${Math.round(e.x)}, \${Math.round(e.y)})\`);
});

// 节点事件（对比）
graph.on('node:click', (e) => {
  addLog(\`👆 点击节点: \${e.node.getLabel()}\`);
});

graph.on('node:selected', (e) => {
  addLog(\`☑️ 选中节点: \${e.node.getLabel()}\`);
});

graph.on('node:unselected', (e) => {
  addLog(\`⬜ 取消选中节点: \${e.node.getLabel()}\`);
});

addLog('事件监听已启动...');
addLog('提示：blank 事件只在空白区域触发，node 事件在节点上触发');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础空白事件', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '事件与节点交互', code: EXAMPLE_2_CODE },
];

/**
 * BlankEventExample - 画布空白区域事件演示
 *
 * 本示例展示了如何使用 blank:click 和 blank:contextmenu 事件
 */
export const BlankEventExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  // 执行用户代码并渲染 Graph
  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph } = await import('../core');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
      };

      const executableCode = `'use strict';
        const { container, console, Graph } = sandbox;
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

  // 左侧面板 - 图例展示
  const LeftPanel = (
    <Panel>
      <PanelHeader icon="📊" title="图例预览" hint="编辑代码后点击运行" />
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

  // 右侧面板 - 代码编辑
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

  // 底部面板 - API 文档
  const BottomPanel = (
    <Panel>
      <PanelHeader icon="📋" title="可用事件" />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: '#64748b', margin: '0 0 12px 0' }}>
            以下是在画布空白区域可用的事件。在节点、边上操作时不会触发这些事件。
          </p>
        </div>
        <Table columns={eventColumns} dataSource={eventData} pagination={false} />
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="blank-event-title" style={{ height: '600px' }}>
        <PanelHeader title="Blank 空白区域事件示例" />
        {/* 示例切换按钮 */}
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
      {/* 浮动锚点 */}
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
          <Anchor.Link href="#blank-event-title" title="Blank 空白区域事件示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#blank-event-list" title="可用事件列表" />
        </Anchor>
      </div>
    </div>
  );
};

export default BlankEventExample;
