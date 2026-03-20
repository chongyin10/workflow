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

// DndOptions 表格数据
const dndOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 250 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const dndOptionsData = [
  { name: 'enabled', type: 'boolean', required: '否', default: 'true', description: '是否启用拖拽功能' },
  { name: 'onDragStart', type: '(e: DragEvent) => void', required: '否', default: '-', description: '拖拽开始回调' },
  { name: 'onDrag', type: '(e: DragEvent) => void', required: '否', default: '-', description: '拖拽中回调' },
  { name: 'onDragEnter', type: '(e: DragEvent) => void', required: '否', default: '-', description: '进入画布回调' },
  { name: 'onDragLeave', type: '(e: DragEvent) => void', required: '否', default: '-', description: '离开画布回调' },
  { name: 'onDrop', type: '(e: DragEvent) => boolean', required: '否', default: '-', description: '放置回调，返回 true 允许放置' },
  { name: 'onDragEnd', type: '(e: DragEvent) => void', required: '否', default: '-', description: '拖拽结束回调' },
  { name: 'validateDrop', type: '(position: Point) => boolean', required: '否', default: '-', description: '验证放置位置是否有效' },
];

// Dnd 类方法表格数据
const dndMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 220 },
  { title: '参数', dataIndex: 'params', width: 280 },
  { title: '返回值', dataIndex: 'return', width: 180 },
  { title: '说明', dataIndex: 'description' },
];

const dndMethodsData = [
  { key: '1', name: 'setEnabled(enabled)', params: 'enabled: boolean', return: 'void', description: '启用或禁用拖拽功能' },
  { key: '2', name: 'isEnabled()', params: '-', return: 'boolean', description: '检查拖拽功能是否启用' },
  { key: '3', name: 'registerSource(element, config)', params: 'element: HTMLElement, config: NodeOptions | (e: DragStartEvent) => NodeOptions', return: 'void', description: '注册拖拽源元素' },
  { key: '4', name: 'unregisterSource(element)', params: 'element: HTMLElement', return: 'void', description: '注销拖拽源元素' },
  { key: '5', name: 'setDragPreview(element)', params: 'element: HTMLElement | null', return: 'void', description: '设置拖拽预览元素' },
];

// 示例 1: 基础拖拽
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 1: 基础拖拽功能
// 创建 Dnd 插件
const dnd = new Dnd({
  enabled: true,
  onDragStart: (e) => {
    console.log('🚀 拖拽开始:', e.nodeOptions?.label);
  },
  onDragEnter: () => {
    console.log('📥 进入画布区域');
  },
  onDragLeave: () => {
    console.log('📤 离开画布区域');
  },
  onDrop: (e) => {
    console.log('✅ 放置节点:', e.nodeOptions?.label, '位置:', e.position);
    return true; // 允许放置
  },
  onDragEnd: () => {
    console.log('🏁 拖拽结束');
  },
});

// 注册插件到 Graph
graph.use(dnd);

// 添加一些初始节点作为参考
graph.addNode({
  id: 'ref-1',
  label: '参考节点 1',
  x: 150,
  y: 100,
  style: { backgroundColor: '#e2e8f0', borderColor: '#cbd5e1', textColor: '#64748b' },
});

graph.addNode({
  id: 'ref-2',
  label: '参考节点 2',
  x: 350,
  y: 200,
  style: { backgroundColor: '#e2e8f0', borderColor: '#cbd5e1', textColor: '#64748b' },
});

console.log('🎨 基础拖拽示例已初始化');
console.log('提示：需要在页面其他位置设置拖拽源元素并调用 dnd.registerSource()');`;

// 示例 2: 拖拽源注册
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 2: 拖拽源注册（代码演示）
// 创建 Dnd 插件
const dnd = new Dnd({
  enabled: true,
  onDrop: (e) => {
    console.log('放置:', e.nodeOptions?.label);
    return true;
  },
});

graph.use(dnd);

// 方式 1: 静态节点配置
// 假设 pageElement 是页面上的 DOM 元素
// dnd.registerSource(pageElement, {
//   id: 'static-node',
//   label: '静态节点',
//   x: 0,
//   y: 0,
//   style: {
//     backgroundColor: '#3b82f6',
//     borderColor: '#2563eb',
//   },
// });

// 方式 2: 动态节点配置（函数形式）
// dnd.registerSource(pageElement, (e) => ({
//   id: \`node-\${Date.now()}\`,
//   label: '动态节点',
//   x: 0,
//   y: 0,
//   style: {
//     backgroundColor: '#22c55e',
//     borderColor: '#16a34a',
//   },
// }));

// 方式 3: 使用节点模板创建不同类型的节点
const nodeTemplates = [
  { label: '处理节点', color: '#3b82f6' },
  { label: '判断节点', color: '#f59e0b' },
  { label: '数据节点', color: '#8b5cf6' },
  { label: '输出节点', color: '#ec4899' },
];

// 为每种节点类型注册拖拽源
// nodeTemplates.forEach(template => {
//   const element = document.getElementById(\`toolbar-\${template.label}\`);
//   if (element) {
//     dnd.registerSource(element, {
//       id: \`node-\${Date.now()}\`,
//       label: template.label,
//       x: 0,
//       y: 0,
//       style: {
//         backgroundColor: template.color,
//         borderColor: template.color,
//       },
//     });
//   }
// });

// 显示节点模板信息
nodeTemplates.forEach((t, i) => {
  graph.addNode({
    id: \`template-\${i}\`,
    label: t.label,
    x: 100 + i * 120,
    y: 150,
    style: {
      backgroundColor: t.color,
      borderColor: t.color,
      textColor: '#ffffff',
    },
  });
});

console.log('拖拽源注册示例：查看代码了解如何使用 dnd.registerSource()');`;

// 示例 3: 拖拽事件
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 3: 完整拖拽事件处理
// 创建带完整事件处理的 Dnd
const dnd = new Dnd({
  enabled: true,
  
  // 拖拽开始时
  onDragStart: (e) => {
    console.log('🟢 onDragStart');
    console.log('  - 拖拽节点:', e.nodeOptions?.label);
    console.log('  - 起始位置:', e.startPosition);
  },
  
  // 拖拽进行中（高频触发）
  onDrag: (e) => {
    // 可以在这里实时更新拖拽预览位置
    // 注意：此事件触发频繁，避免在这里执行复杂操作
  },
  
  // 进入画布区域
  onDragEnter: (e) => {
    console.log('🟦 onDragEnter: 进入画布区域');
  },
  
  // 离开画布区域
  onDragLeave: (e) => {
    console.log('🟥 onDragLeave: 离开画布区域');
  },
  
  // 放置时
  onDrop: (e) => {
    console.log('✅ onDrop');
    console.log('  - 放置位置:', e.position);
    console.log('  - 节点配置:', e.nodeOptions);
    return true; // 返回 true 允许放置
  },
  
  // 拖拽结束时
  onDragEnd: (e) => {
    console.log('🏁 onDragEnd: 拖拽结束');
  },
});

graph.use(dnd);

// 添加视觉反馈节点
graph.addNode({
  id: 'event-demo-1',
  label: '事件监听示例',
  x: 200,
  y: 100,
  style: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
});

graph.addNode({
  id: 'event-demo-2',
  label: '查看控制台输出',
  x: 200,
  y: 200,
  style: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

console.log('打开浏览器控制台查看完整事件日志');`;

// 示例 4: 验证放置
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 4: 放置位置验证
const dnd = new Dnd({
  enabled: true,
  
  // 验证放置位置
  validateDrop: (position) => {
    // 只允许放置在 x > 100 的区域（右侧区域）
    const isValid = position.x > 100;
    if (!isValid) {
      console.log('❌ 放置被拒绝：位置 x 必须大于 100');
    }
    return isValid;
  },
  
  onDrop: (e) => {
    console.log('✅ 放置成功:', e.position);
    return true;
  },
});

graph.use(dnd);

// 添加区域标记
// 禁止放置区域
graph.addNode({
  id: 'forbidden-zone',
  label: '🚫 禁止放置区 (x < 100)',
  x: 50,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 140,
    height: 200,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
    borderWidth: 2,
    borderRadius: 4,
    textColor: '#ef4444',
  },
});

// 允许放置区域
graph.addNode({
  id: 'allowed-zone',
  label: '✅ 允许放置区 (x > 100)',
  x: 330,
  y: 150,
  shape: Shape.Rect,
  style: {
    width: 340,
    height: 200,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
    borderWidth: 2,
    borderRadius: 4,
    textColor: '#22c55e',
  },
});

console.log('此示例展示了如何使用 validateDrop 验证放置位置');`;

// 示例 5: 完整工作流
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 300,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 5: 完整工作流画布
const dnd = new Dnd({
  enabled: true,
  onDrop: (e) => {
    console.log('添加节点:', e.nodeOptions?.label);
    return true;
  },
});

graph.use(dnd);

// 创建工作流模板节点
const workflowNodes = [
  { id: 'start', label: '开始', x: 100, y: 80, color: '#22c55e' },
  { id: 'process', label: '处理', x: 250, y: 80, color: '#3b82f6' },
  { id: 'decision', label: '判断', x: 400, y: 80, color: '#f59e0b' },
  { id: 'end', label: '结束', x: 250, y: 220, color: '#ef4444' },
];

workflowNodes.forEach((n) => {
  const node = graph.addNode({
    id: n.id,
    label: n.label,
    x: n.x,
    y: n.y,
    style: {
      backgroundColor: n.color,
      borderColor: n.color,
      textColor: '#ffffff',
    },
  });
  // 添加连接端口
  node.addPort({ id: \`\${n.id}-out\`, position: 'right', visible: true });
  node.addPort({ id: \`\${n.id}-in\`, position: 'left', visible: true });
});

// 创建连接边
graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'start', portId: 'start-out' },
  target: { nodeId: 'process', portId: 'process-in' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-2',
  source: { nodeId: 'process', portId: 'process-out' },
  target: { nodeId: 'decision', portId: 'decision-in' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

graph.addEdge({
  id: 'edge-3',
  source: { nodeId: 'decision', portId: 'decision-out' },
  target: { nodeId: 'end', portId: 'end-in' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

console.log('工作流画布已创建');
console.log('使用 Dnd 插件可以从外部拖拽添加更多节点');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础拖拽', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '拖拽源注册', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '拖拽事件', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '放置验证', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '完整工作流', code: EXAMPLE_5_CODE },
];

/**
 * DndExample - Dnd 拖拽插件使用示例
 */
export default function DndExample() {
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
      const { Graph, Shape, EdgeType, Dnd } = await import('../core');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Shape,
        EdgeType,
        Dnd,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Shape, EdgeType, Dnd } = sandbox;
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
      <PanelHeader icon="📋" title="API 文档" />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div id="dnd-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            DndOptions - 拖拽配置选项
          </h3>
          <Table columns={dndOptionsColumns} dataSource={dndOptionsData} pagination={false} />
        </div>
        <div id="dnd-methods-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>Dnd 类方法</h3>
          <Table columns={dndMethodsColumns} dataSource={dndMethodsData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="dnd-example-title" style={{ height: '600px' }}>
        <PanelHeader title="Dnd 拖拽示例" />
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
          <Anchor.Link href="#dnd-example-title" title="Dnd 拖拽示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#dnd-options-section" title="DndOptions" />
          <Anchor.Link href="#dnd-methods-section" title="Dnd 类方法" />
        </Anchor>
      </div>
    </div>
  );
}
