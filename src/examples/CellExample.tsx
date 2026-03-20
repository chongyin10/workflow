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

// CellOptions 表格数据
const cellOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 200 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const cellOptionsData = [
  { name: 'id', type: 'string', required: '是', default: '-', description: 'Cell 唯一标识符（自动生成）' },
  { name: 'label', type: 'string', required: '否', default: "''", description: 'Cell 显示文本' },
  { name: 'data', type: 'Record<string, any>', required: '否', default: '{}', description: '自定义业务数据' },
  { name: 'visible', type: 'boolean', required: '否', default: 'true', description: '是否可见' },
  { name: 'locked', type: 'boolean', required: '否', default: 'false', description: '是否锁定（不可交互）' },
  { name: 'selected', type: 'boolean', required: '否', default: 'false', description: '是否选中' },
];

// Cell 类方法表格数据
const cellMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 220 },
  { title: '参数', dataIndex: 'params', width: 250 },
  { title: '返回值', dataIndex: 'return', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const cellMethodsData = [
  { key: '1', name: 'getId()', params: '-', return: 'string', description: '获取 Cell 唯一 ID' },
  { key: '2', name: 'getLabel() / setLabel(label)', params: 'label: string', return: 'string / void', description: '获取/设置标签' },
  { key: '3', name: 'getData() / setData(data)', params: 'data: Record<string, any>', return: 'any / void', description: '获取/设置自定义数据' },
  { key: '4', name: 'getSelected() / setSelected(selected)', params: 'selected: boolean', return: 'boolean / void', description: '获取/设置选中状态' },
  { key: '5', name: 'getHovered() / setHovered(hovered)', params: 'hovered: boolean', return: 'boolean / void', description: '获取/设置悬停状态' },
  { key: '6', name: 'getVisible() / setVisible(visible)', params: 'visible: boolean', return: 'boolean / void', description: '获取/设置可见性' },
  { key: '7', name: 'getLocked() / setLocked(locked)', params: 'locked: boolean', return: 'boolean / void', description: '获取/设置锁定状态' },
  { key: '8', name: 'toJSON()', params: '-', return: 'object', description: '序列化为 JSON' },
  { key: '9', name: 'fromJSON(json)', params: 'json: object', return: 'void', description: '从 JSON 反序列化' },
  { key: '10', name: 'clone()', params: '-', return: 'Cell', description: '克隆当前 Cell' },
];

// 继承关系说明
const inheritanceData = [
  { key: '1', name: 'Cell (抽象基类)', description: '所有图形元素的抽象基类，提供通用的属性和方法' },
  { key: '2', name: '├─ Node (节点)', description: '继承 Cell，表示图形中的节点元素' },
  { key: '3', name: '│   └─ Port (连接桩)', description: '继承 Cell，作为节点的子元素' },
  { key: '4', name: '├─ Edge (边)', description: '继承 Cell，表示节点之间的连接线' },
  { key: '5', name: '└─ Label (标签)', description: '继承 Cell，用于显示文本标签' },
];

// 示例 1: 基础 Cell 属性
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 280,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 1: 基础 Cell 属性
// 创建基础 Cell（通过 Node 演示）
const cell1 = graph.addNode({
  id: 'cell-basic',
  label: '基础 Cell',
  x: 100,
  y: 120,
  shape: Shape.Rect,
  style: {
    width: 140,
    height: 80,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
  },
  data: { type: 'basic', priority: 1 },
});

// 获取 Cell 属性
console.log('Cell ID:', cell1.getId());
console.log('Cell Label:', cell1.getLabel());
console.log('Cell Data:', cell1.getData());
console.log('Is Selected:', cell1.getSelected());
console.log('Is Visible:', cell1.getVisible());
console.log('Is Locked:', cell1.getLocked());

// 修改标签
cell1.setLabel('已修改的标签');

// 修改数据
cell1.setData({ type: 'basic', priority: 2, updated: true });

// 创建第二个 Cell 用于对比
const cell2 = graph.addNode({
  id: 'cell-locked',
  label: '锁定 Cell',
  x: 350,
  y: 120,
  shape: Shape.Circle,
  style: {
    width: 100,
    height: 100,
    backgroundColor: '#64748b',
    borderColor: '#475569',
    textColor: '#ffffff',
  },
});

// 锁定 Cell（不可交互）
cell2.setLocked(true);
console.log('Cell2 锁定状态:', cell2.getLocked());`;

// 示例 2: 选中与悬停状态
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 280,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
  onNodeSelect: (node) => {
    console.log('选中节点:', node?.getId() || '无');
  },
});

// 示例 2: 选中与悬停状态
// 创建三个 Cell 用于演示状态
const cells = [
  { id: 'cell-1', x: 100, y: 100, color: '#3b82f6', label: '默认状态' },
  { id: 'cell-2', x: 250, y: 100, color: '#22c55e', label: '预选中' },
  { id: 'cell-3', x: 400, y: 100, color: '#f59e0b', label: '预悬停' },
];

cells.forEach((c) => {
  const cell = graph.addNode({
    id: c.id,
    label: c.label,
    x: c.x,
    y: c.y,
    shape: Shape.Rect,
    style: {
      width: 120,
      height: 80,
      backgroundColor: c.color,
      borderColor: c.color,
      textColor: '#ffffff',
      hoverBackgroundColor: '#64748b', // 悬停时的背景色
      selectedBorderColor: '#ef4444', // 选中时的边框色
    },
  });
});

// 通过代码设置选中状态
const cell2 = graph.getNode('cell-2');
if (cell2) {
  cell2.setSelected(true);
  console.log('cell-2 选中状态:', cell2.getSelected());
}

// 显示状态说明
graph.addNode({
  id: 'status-note',
  label: '点击 Cell 查看选中状态变化',
  x: 250,
  y: 220,
  shape: Shape.Rect,
  style: {
    width: 240,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    textColor: '#64748b',
  },
});

console.log('提示：尝试点击 Cell 查看选中状态变化');`;

// 示例 3: 可见性控制
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 280,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 3: 可见性控制
// 创建可见的 Cell
const visibleCell = graph.addNode({
  id: 'cell-visible',
  label: '可见 Cell',
  x: 150,
  y: 120,
  shape: Shape.Circle,
  style: {
    width: 100,
    height: 100,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
  },
});

// 创建初始隐藏的 Cell
const hiddenCell = graph.addNode({
  id: 'cell-hidden',
  label: '隐藏 Cell',
  x: 350,
  y: 120,
  shape: Shape.Circle,
  style: {
    width: 100,
    height: 100,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
  },
});

// 设置为不可见
hiddenCell.setVisible(false);

console.log('visibleCell 可见性:', visibleCell.getVisible());
console.log('hiddenCell 可见性:', hiddenCell.getVisible());

// 演示切换可见性（通过定时器）
setTimeout(() => {
  hiddenCell.setVisible(true);
  console.log('3秒后: hiddenCell 已显示');
  
  setTimeout(() => {
    visibleCell.setVisible(false);
    console.log('6秒后: visibleCell 已隐藏');
  }, 3000);
}, 3000);

// 说明文字
graph.addNode({
  id: 'note',
  label: '查看控制台和 Cell 可见性变化',
  x: 250,
  y: 220,
  shape: Shape.Rect,
  style: {
    width: 240,
    height: 40,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
  },
});

console.log('Cell 可见性将在 3 秒后发生变化...');`;

// 示例 4: 序列化与反序列化
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 280,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 4: 序列化与反序列化
// 创建原始 Cell
const originalCell = graph.addNode({
  id: 'cell-original',
  label: '原始 Cell',
  x: 150,
  y: 120,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
  },
  data: {
    category: 'process',
    metadata: {
      author: 'admin',
      createdAt: new Date().toISOString(),
      version: '1.0.0',
    },
    tags: ['important', 'reviewed'],
  },
});

// 序列化为 JSON
const json = originalCell.toJSON();
console.log('Cell JSON:');
console.log(JSON.stringify(json, null, 2));

// 从 JSON 创建新 Cell
const restoredCell = graph.addNode({
  ...json,
  id: 'cell-restored', // 需要新的 ID
  x: 350,
  y: 120,
  label: '恢复的 Cell',
});

// 比较数据
console.log('原始数据:', originalCell.getData());
console.log('恢复数据:', restoredCell.getData());

// 添加说明
graph.addNode({
  id: 'note',
  label: '查看控制台查看序列化输出',
  x: 250,
  y: 220,
  shape: Shape.Rect,
  style: {
    width: 240,
    height: 40,
    backgroundColor: '#e0f2fe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
  },
});`;

// 示例 5: 克隆功能
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 280,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 5: 克隆功能
// 创建原始 Cell
const originalCell = graph.addNode({
  id: 'cell-source',
  label: '源 Cell',
  x: 150,
  y: 120,
  shape: Shape.Rect,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#14b8a6',
    borderColor: '#0d9488',
    textColor: '#ffffff',
  },
  data: { source: true, value: 100 },
});

// 添加端口
originalCell.addPort({ id: 'port-1', position: 'right', visible: true });

// 克隆 Cell（使用 clone 方法）
const clonedData = originalCell.clone();

// 创建克隆的节点
const clonedCell = graph.addNode({
  id: 'cell-cloned',
  label: clonedData.getLabel() + ' (克隆)',
  x: 350,
  y: 120,
  shape: Shape.Rect,
  style: originalCell.getStyle(),
  data: clonedData.getData(),
});

// 修改克隆体的数据
clonedCell.setData({ ...clonedCell.getData(), cloned: true });

// 对比
console.log('原始 Cell ID:', originalCell.getId());
console.log('克隆 Cell ID:', clonedCell.getId());
console.log('原始数据:', originalCell.getData());
console.log('克隆数据:', clonedCell.getData());

// 添加连接线
originalCell.addPort({ id: 'port-out', position: 'right', visible: true });
clonedCell.addPort({ id: 'port-in', position: 'left', visible: true });

graph.addEdge({
  id: 'edge-clone',
  source: { nodeId: 'cell-source', portId: 'port-out' },
  target: { nodeId: 'cell-cloned', portId: 'port-in' },
  type: EdgeType.Straight,
  style: { stroke: '#64748b', strokeWidth: 2 },
});

console.log('克隆完成！');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础属性', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '选中与悬停', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '可见性控制', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '序列化', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '克隆功能', code: EXAMPLE_5_CODE },
];

/**
 * CellExample - Cell 基类组件使用示例
 */
export const CellExample: React.FC = () => {
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
      const { Graph, Shape, EdgeType } = await import('../core');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Shape,
        EdgeType,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Shape, EdgeType } = sandbox;
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
        <div id="cell-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            CellOptions - Cell 配置选项
          </h3>
          <Table columns={cellOptionsColumns} dataSource={cellOptionsData} pagination={false} />
        </div>
        <div id="cell-methods-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>Cell 类方法</h3>
          <Table columns={cellMethodsColumns} dataSource={cellMethodsData} pagination={false} />
        </div>
        <div id="cell-inheritance-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>继承关系</h3>
          <Table
            columns={[
              { title: '层级', dataIndex: 'name', width: 250 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={inheritanceData}
            pagination={false}
          />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="cell-example-title" style={{ height: '600px' }}>
        <PanelHeader title="Cell 基类示例" />
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
          <Anchor.Link href="#cell-example-title" title="Cell 基类示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#cell-options-section" title="CellOptions" />
          <Anchor.Link href="#cell-methods-section" title="Cell 类方法" />
          <Anchor.Link href="#cell-inheritance-section" title="继承关系" />
        </Anchor>
      </div>
    </div>
  );
};

export default CellExample;
