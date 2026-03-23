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

// RowConfig 表格数据
const rowConfigColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 200 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const rowConfigData = [
  { name: 'id', type: 'string', required: '是', default: '-', description: '行唯一标识符' },
  { name: 'label', type: 'string', required: '否', default: "''", description: '行显示文本' },
  { name: 'leftPort', type: 'PortOptions', required: '否', default: 'undefined', description: '左侧连接桩配置' },
  { name: 'rightPort', type: 'PortOptions', required: '否', default: 'undefined', description: '右侧连接桩配置' },
  { name: 'data', type: 'Record<string, any>', required: '否', default: '{}', description: '自定义业务数据' },
];

// DynamicHeightNode 类方法表格数据
const nodeMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 260 },
  { title: '参数', dataIndex: 'params', width: 250 },
  { title: '返回值', dataIndex: 'return', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const nodeMethodsData = [
  { name: 'addRow(config, index?)', params: 'RowConfig, number?', return: 'void', description: '添加新行（默认添加到末尾）' },
  { name: 'removeRow(rowId)', params: 'string', return: 'boolean', description: '移除指定行' },
  { name: 'updateRow(rowId, updates)', params: 'string, Partial<RowConfig>', return: 'boolean', description: '更新行配置' },
  { name: 'getRows()', params: '-', return: 'RowConfig[]', description: '获取所有行配置' },
  { name: 'getRowCount()', params: '-', return: 'number', description: '获取行数' },
  { name: 'getRowData(rowId)', params: 'string', return: 'RowData | undefined', description: '获取行数据' },
  { name: 'getRowPort(rowId, side)', params: 'string, "left" | "right"', return: 'Port | undefined', description: '获取行的连接桩' },
  { name: 'isLeftPort(portId)', params: 'string', return: 'boolean', description: '检查连接桩是否在左侧' },
  { name: 'isRightPort(portId)', params: 'string', return: 'boolean', description: '检查连接桩是否在右侧' },
  { name: 'updateExtendedStyle(style)', params: 'Partial<DynamicHeightNodeStyle>', return: 'void', description: '更新扩展样式并重绘' },
];

// 示例 1: 基础动态高度节点
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

// 示例 1: 基础动态高度节点
// 创建一个 3 行的节点，每行都有连接桩
const node = new DynamicHeightNode({
  id: 'basic-node',
  x: 300,
  y: 140,
  label: '处理节点',
  rows: [
    {
      id: 'row-1',
      label: '数据清洗',
      leftPort: { id: 'in-1', label: 'in' },
      rightPort: { id: 'out-1', label: 'out' },
    },
    {
      id: 'row-2',
      label: '格式转换',
      leftPort: { id: 'in-2', label: 'in' },
      rightPort: { id: 'out-2', label: 'out' },
    },
    {
      id: 'row-3',
      label: '结果输出',
      rightPort: { id: 'out-3', label: 'out' },
    },
  ],
  style: {
    width: 180,
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
    rowLabelColor: '#1e40af',
  },
});

// 将节点添加到画布
graph.addNode(node);

console.log('节点创建成功！');
console.log('行数:', node.getRowCount());
console.log('节点高度:', node.getStyle().height);`;

// 示例 2: 不同行数和布局
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 280,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: { enabled: true, size: 20, color: '#e2e8f0' },
});

// 示例 2: 创建不同行数的节点进行对比
const nodes = [
  {
    id: 'node-1',
    x: 120,
    y: 140,
    label: '1行节点',
    rowCount: 1,
    color: '#fecaca',
    border: '#ef4444',
  },
  {
    id: 'node-2',
    x: 300,
    y: 140,
    label: '3行节点',
    rowCount: 3,
    color: '#fef3c7',
    border: '#f59e0b',
  },
  {
    id: 'node-3',
    x: 480,
    y: 140,
    label: '5行节点',
    rowCount: 5,
    color: '#d1fae5',
    border: '#10b981',
  },
];

nodes.forEach((n) => {
  // 根据行数生成 rows
  const rows = Array.from({ length: n.rowCount }, (_, i) => ({
    id: 'row-' + (i + 1),
    label: '行 ' + (i + 1),
    leftPort: i % 2 === 0 ? { id: 'left-' + i, label: 'in' } : undefined,
    rightPort: i % 2 === 1 ? { id: 'right-' + i, label: 'out' } : undefined,
  }));

  const node = new DynamicHeightNode({
    id: n.id,
    x: n.x,
    y: n.y,
    label: n.label,
    rows,
    style: {
      width: 140,
      backgroundColor: n.color,
      borderColor: n.border,
      textColor: '#1f2937',
      rowHeight: 28,
      rowGap: 2,
    },
  });

  graph.addNode(node);
  console.log(n.label + ': 高度 ' + node.getStyle().height + 'px, 行数 ' + node.getRowCount());
});

console.log('节点高度随行数自动调整！');`;

// 示例 3: 动态添加/删除行
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

// 示例 3: 动态添加/删除行
const node = new DynamicHeightNode({
  id: 'dynamic-node',
  x: 300,
  y: 140,
  label: '动态节点',
  rows: [
    { id: 'row-1', label: '初始行 1', leftPort: { id: 'in-1' }, rightPort: { id: 'out-1' } },
    { id: 'row-2', label: '初始行 2', leftPort: { id: 'in-2' }, rightPort: { id: 'out-2' } },
  ],
  style: {
    width: 180,
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
    textColor: '#9d174d',
  },
});

graph.addNode(node);

console.log('初始行数:', node.getRowCount());
console.log('初始高度:', node.getStyle().height);

// 动态添加行（3秒后）
setTimeout(() => {
  node.addRow({
    id: 'row-3',
    label: '动态添加的行',
    leftPort: { id: 'new-in' },
    rightPort: { id: 'new-out' },
  });
  
  graph.scheduleRender();
  console.log('添加后行数:', node.getRowCount());
  console.log('添加后高度:', node.getStyle().height);
}, 3000);

// 再添加一行（6秒后）
setTimeout(() => {
  node.addRow({
    id: 'row-4',
    label: '又一个新行',
    rightPort: { id: 'another-out' },
  });
  
  graph.scheduleRender();
  console.log('再次添加后行数:', node.getRowCount());
  console.log('再次添加后高度:', node.getStyle().height);
}, 6000);

console.log('将在3秒后添加行，6秒后再添加一行...');`;

// 示例 4: 连接桩连线
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

// 示例 4: 连接不同节点的行连接桩
const inputNode = new DynamicHeightNode({
  id: 'input-node',
  x: 120,
  y: 140,
  label: '输入节点',
  rows: [
    { id: 'in-1', label: '数据源', rightPort: { id: 'out-1' } },
    { id: 'in-2', label: '配置项', rightPort: { id: 'out-2' } },
  ],
  style: {
    width: 140,
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
  },
});

const processNode = new DynamicHeightNode({
  id: 'process-node',
  x: 300,
  y: 140,
  label: '处理节点',
  rows: [
    { id: 'proc-1', label: '清洗', leftPort: { id: 'p-in-1' }, rightPort: { id: 'p-out-1' } },
    { id: 'proc-2', label: '转换', leftPort: { id: 'p-in-2' }, rightPort: { id: 'p-out-2' } },
  ],
  style: {
    width: 140,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
  },
});

const outputNode = new DynamicHeightNode({
  id: 'output-node',
  x: 480,
  y: 140,
  label: '输出节点',
  rows: [
    { id: 'out-1', label: '文件导出', leftPort: { id: 'in-1' } },
    { id: 'out-2', label: '数据库存储', leftPort: { id: 'in-2' } },
  ],
  style: {
    width: 140,
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    textColor: '#065f46',
  },
});

// 添加节点
graph.addNode(inputNode);
graph.addNode(processNode);
graph.addNode(outputNode);

// 创建连接边
graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'input-node', portId: 'out-1' },
  target: { nodeId: 'process-node', portId: 'p-in-1' },
  type: EdgeType.Bezier,
});

graph.addEdge({
  id: 'edge-2',
  source: { nodeId: 'input-node', portId: 'out-2' },
  target: { nodeId: 'process-node', portId: 'p-in-2' },
  type: EdgeType.Bezier,
});

graph.addEdge({
  id: 'edge-3',
  source: { nodeId: 'process-node', portId: 'p-out-1' },
  target: { nodeId: 'output-node', portId: 'in-1' },
  type: EdgeType.Bezier,
});

graph.addEdge({
  id: 'edge-4',
  source: { nodeId: 'process-node', portId: 'p-out-2' },
  target: { nodeId: 'output-node', portId: 'in-2' },
  type: EdgeType.Bezier,
});

console.log('已创建数据流：输入 -> 处理 -> 输出');`;

// 示例 5: 样式自定义
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

// 示例 5: 自定义样式
const node = new DynamicHeightNode({
  id: 'styled-node',
  x: 300,
  y: 140,
  label: '自定义样式节点',
  rows: [
    { id: 'row-1', label: '大间距行', leftPort: { id: 'in-1' } },
    { id: 'row-2', label: '大间距行', rightPort: { id: 'out-2' } },
    { id: 'row-3', label: '大间距行', leftPort: { id: 'in-3' }, rightPort: { id: 'out-3' } },
  ],
  style: {
    // 基础样式
    width: 200,
    backgroundColor: '#f3e8ff',
    borderColor: '#a855f7',
    borderWidth: 2,
    borderRadius: 8,
    textColor: '#6b21a8',
    
    // 扩展样式
    rowHeight: 48,          // 增加行高
    rowGap: 8,              // 增加行间距
    headerHeight: 40,       // 增加头部高度
    footerPadding: 12,      // 增加底部内边距
    leftPortAreaWidth: 24,  // 左侧连接桩区域
    rightPortAreaWidth: 24, // 右侧连接桩区域
    rowLabelFontSize: 14,   // 行标签字体
    rowLabelColor: '#7c3aed', // 行标签颜色
  },
});

graph.addNode(node);

console.log('自定义样式节点创建成功！');
console.log('行高:', 48, '行间距:', 8);
console.log('实际高度:', node.getStyle().height);

// 演示动态修改样式（3秒后）
setTimeout(() => {
  node.updateExtendedStyle({
    rowHeight: 32,
    rowGap: 4,
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  });
  
  graph.scheduleRender();
  console.log('样式已更新！新高度:', node.getStyle().height);
}, 3000);`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础节点', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '不同行数', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '动态增删行', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '连接桩连线', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '样式自定义', code: EXAMPLE_5_CODE },
];

/**
 * DynamicHeightNodeExample - 动态高度节点示例
 *
 * 展示功能：
 * 1. 基础动态高度节点
 * 2. 不同行数对比
 * 3. 动态添加/删除行
 * 4. 连接桩间连线
 * 5. 样式自定义
 */
export default function DynamicHeightNodeExample() {
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
      const { Graph, DynamicHeightNode, EdgeType } = await import('../core');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        DynamicHeightNode,
        EdgeType,
      };

      const executableCode = "'use strict';\n" +
        "const { container, console, Graph, DynamicHeightNode, EdgeType } = sandbox;\n" +
        codeToExecute;

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
      <PanelHeader icon="📐" title="图例预览" hint="编辑代码后点击运行" />
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
        <div id="row-config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            RowConfig - 行配置选项
          </h3>
          <Table columns={rowConfigColumns} dataSource={rowConfigData} pagination={false} />
        </div>
        <div id="node-methods-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            DynamicHeightNode 类方法
          </h3>
          <Table columns={nodeMethodsColumns} dataSource={nodeMethodsData} pagination={false} />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="dynamic-height-node-title" style={{ height: '600px' }}>
        <PanelHeader title="动态高度节点示例" />
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
          <Anchor.Link href="#dynamic-height-node-title" title="动态高度节点示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#row-config-section" title="RowConfig" />
          <Anchor.Link href="#node-methods-section" title="类方法" />
        </Anchor>
      </div>
    </div>
  );
}
