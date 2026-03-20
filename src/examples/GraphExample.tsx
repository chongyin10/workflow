import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Splitter, Table, Anchor } from '@zjpcy/simple-design';
import {
  CodeEditor,
  Panel,
  PanelHeader,
  PanelContent,
  PanelToolbar,
  Button,
} from './components/CodeEditor';
import './styles/panel.css';

// GraphOptions 表格数据
const graphOptionsColumns = [
  { title: '属性名', dataIndex: 'name', width: 180 },
  { title: '类型', dataIndex: 'type', width: 200 },
  { title: '必填', dataIndex: 'required', width: 80 },
  { title: '默认值', dataIndex: 'default', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const graphOptionsData = [
  { name: 'container', type: 'HTMLElement', required: '是', default: '-', description: '容器元素，Graph 将在此元素内渲染' },
  { name: 'width', type: 'number', required: '否', default: '800', description: '画布宽度' },
  { name: 'height', type: 'number', required: '否', default: '600', description: '画布高度' },
  { name: 'initialOffsetX', type: 'number', required: '否', default: '0', description: '初始 X 轴偏移量' },
  { name: 'initialOffsetY', type: 'number', required: '否', default: '0', description: '初始 Y 轴偏移量' },
  { name: 'minZoom', type: 'number', required: '否', default: '0.1', description: '最小缩放比例' },
  { name: 'maxZoom', type: 'number', required: '否', default: '5', description: '最大缩放比例' },
  { name: 'draggable', type: 'boolean', required: '否', default: 'true', description: '是否启用画布拖拽' },
  { name: 'scalable', type: 'boolean', required: '否', default: 'true', description: '是否启用缩放' },
  { name: 'draggingCursor', type: 'string', required: '否', default: "'grabbing'", description: '拖拽时的光标样式' },
  { name: 'onDragEnd', type: '(offset: Point) => void', required: '否', default: '-', description: '拖拽完成回调函数' },
  { name: 'onZoom', type: '(scale: number, offset: Point) => void', required: '否', default: '-', description: '缩放完成回调函数' },
  { name: 'onNodeSelect', type: '(node: Node | null) => void', required: '否', default: '-', description: '节点选中回调函数' },
  { name: 'backgroundColor', type: 'string', required: '否', default: "'#ffffff'", description: '背景颜色' },
  { name: 'grid.enabled', type: 'boolean', required: '否', default: 'true', description: '是否启用网格' },
  { name: 'grid.size', type: 'number', required: '否', default: '20', description: '网格大小' },
  { name: 'grid.color', type: 'string', required: '否', default: "'#e5e7eb'", description: '网格颜色' },
];

// Graph 类方法表格数据
const graphMethodsColumns = [
  { title: '方法名', dataIndex: 'name', width: 200 },
  { title: '参数', dataIndex: 'params', width: 250 },
  { title: '返回值', dataIndex: 'return', width: 200 },
  { title: '说明', dataIndex: 'description' },
];

const graphMethodsData = [
  { key: '1', name: 'addNode(options)', params: 'options: NodeOptions', return: 'Node', description: '添加节点到画布' },
  { key: '2', name: 'removeNode(nodeId)', params: 'nodeId: string', return: 'boolean', description: '移除指定节点' },
  { key: '3', name: 'getNode(nodeId)', params: 'nodeId: string', return: 'Node | undefined', description: '获取指定节点' },
  { key: '4', name: 'getAllNodes()', params: '-', return: 'Node[]', description: '获取所有节点' },
  { key: '5', name: 'getSelectedNode()', params: '-', return: 'Node | null', description: '获取当前选中的节点' },
  { key: '6', name: 'selectNode(nodeId)', params: 'nodeId: string | null', return: 'void', description: '选中指定节点' },
  { key: '7', name: 'clearNodes()', params: '-', return: 'void', description: '清除所有节点' },
  { key: '8', name: 'addEdge(options)', params: 'options: EdgeOptions', return: 'Edge', description: '添加边到画布' },
  { key: '9', name: 'removeEdge(edgeId)', params: 'edgeId: string', return: 'boolean', description: '移除指定边' },
  { key: '10', name: 'getEdge(edgeId)', params: 'edgeId: string', return: 'Edge | undefined', description: '获取指定边' },
  { key: '11', name: 'getAllEdges()', params: '-', return: 'Edge[]', description: '获取所有边' },
  { key: '12', name: 'getSelectedEdge()', params: '-', return: 'Edge | null', description: '获取当前选中的边' },
  { key: '13', name: 'selectEdge(edgeId)', params: 'edgeId: string | null', return: 'void', description: '选中指定边' },
  { key: '14', name: 'clearEdges()', params: '-', return: 'void', description: '清除所有边' },
  { key: '15', name: 'clear()', params: '-', return: 'void', description: '清除所有节点和边' },
  { key: '16', name: 'setOffset(offset)', params: 'offset: Point', return: 'void', description: '设置画布偏移量' },
  { key: '17', name: 'setScale(scale)', params: 'scale: number', return: 'void', description: '设置缩放比例' },
  { key: '18', name: 'panTo(offset, duration?, easing?)', params: 'offset: Point, duration?: number, easing?: (t: number) => number', return: 'Promise<void>', description: '平移到指定位置（带动画）' },
  { key: '19', name: 'zoomTo(scale, duration?, easing?)', params: 'scale: number, duration?: number, easing?: (t: number) => number', return: 'Promise<void>', description: '缩放到指定比例（带动画）' },
  { key: '20', name: 'reset()', params: '-', return: 'void', description: '重置视图到初始状态' },
  { key: '21', name: 'fitToContent(bounds, padding?)', params: 'bounds: { x, y, width, height }, padding?: number', return: 'void', description: '自适应内容到视图' },
  { key: '22', name: 'screenToWorld(point)', params: 'point: Point', return: 'Point', description: '屏幕坐标转世界坐标' },
  { key: '23', name: 'worldToScreen(point)', params: 'point: Point', return: 'Point', description: '世界坐标转屏幕坐标' },
  { key: '24', name: 'toJSON()', params: '-', return: '{ cells: Array }', description: '导出图为 JSON 格式' },
  { key: '25', name: 'destroy()', params: '-', return: 'void', description: '销毁 Graph 实例' },
  { key: '26', name: 'on(eventName, handler)', params: 'eventName: string, handler: EventHandler', return: '() => void', description: '注册事件监听器' },
  { key: '27', name: 'once(eventName, handler)', params: 'eventName: string, handler: EventHandler', return: '() => void', description: '注册一次性事件监听器' },
  { key: '28', name: 'off(eventName, handler?)', params: 'eventName: string, handler?: EventHandler', return: 'void', description: '注销事件监听器' },
  { key: '29', name: 'use(plugin)', params: 'plugin: Plugin', return: 'this', description: '注册插件' },
  { key: '30', name: 'unuse(pluginName)', params: 'pluginName: string', return: 'this', description: '注销插件' },
];

// 默认示例代码
const DEFAULT_EXAMPLE_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 600,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
  grid: {
    enabled: true,
    size: 20,
    color: '#e2e8f0',
  },
  onNodeSelect: (node) => {
    console.log('选中节点:', node?.getId());
  },
});

// 开始节点 - 圆形
const startNode = graph.addNode({
  id: 'node-start',
  label: '开始',
  x: 150,
  y: 200,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    textColor: '#ffffff',
    hoverBackgroundColor: '#4ade80',
  },
});

// 处理节点 - 矩形
const processNode = graph.addNode({
  id: 'node-process',
  label: '处理',
  x: 300,
  y: 200,
  shape: Shape.Rect,
  style: {
    width: 100,
    height: 60,
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    borderRadius: 8,
    textColor: '#ffffff',
    hoverBackgroundColor: '#60a5fa',
  },
});

// 结束节点 - 圆形
const endNode = graph.addNode({
  id: 'node-end',
  label: '结束',
  x: 450,
  y: 200,
  shape: Shape.Circle,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    textColor: '#ffffff',
    hoverBackgroundColor: '#f87171',
  },
});

// 添加连接桩
startNode.addPort({
  id: 'port-start-right',
  position: 'right',
  visible: true,
});

processNode.addPort({
  id: 'port-process-left',
  position: 'left',
  visible: true,
});

processNode.addPort({
  id: 'port-process-right',
  position: 'right',
  visible: true,
});

endNode.addPort({
  id: 'port-end-left',
  position: 'left',
  visible: true,
});

// 直线连接
graph.addEdge({
  id: 'edge-1',
  source: { nodeId: 'node-start', portId: 'port-start-right' },
  target: { nodeId: 'node-process', portId: 'port-process-left' },
  type: EdgeType.Straight,
  style: {
    stroke: '#64748b',
    strokeWidth: 2,
    arrowSize: 10,
  },
});

// 贝塞尔曲线
graph.addEdge({
  id: 'edge-2',
  source: { nodeId: 'node-process', portId: 'port-process-right' },
  target: { nodeId: 'node-end', portId: 'port-end-left' },
  type: EdgeType.Bezier,
  style: {
    stroke: '#8b5cf6',
    strokeWidth: 2,
    arrowSize: 8,
  },
});`;

/**
 * GraphExample - 交互式图表示例
 */
export const GraphExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(DEFAULT_EXAMPLE_CODE);
  const [editorKey, setEditorKey] = useState(0);

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
    codeRef.current = DEFAULT_EXAMPLE_CODE;
    setEditorKey(prev => prev + 1);
    executeCode(DEFAULT_EXAMPLE_CODE);
  }, [executeCode]);

  useEffect(() => {
    executeCode(DEFAULT_EXAMPLE_CODE);
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
          value={DEFAULT_EXAMPLE_CODE}
          onUpdate={handleCodeChange}
          language="tsx"
        />
      </PanelContent>
      <PanelToolbar>
        <Button onClick={handleResetCode}>重置</Button>
        <Button type="primary" onClick={handleRunCode}>▶ 运行代码</Button>
      </PanelToolbar>
    </Panel>
  );

  // 底部面板 - API 文档
  const BottomPanel = (
    <Panel>
      <PanelHeader icon="📋" title="API 文档" />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div id="graph-options-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            GraphOptions - 画布配置选项
          </h3>
          <Table
            columns={graphOptionsColumns}
            dataSource={graphOptionsData}
            pagination={false}
          />
        </div>
        <div id="graph-methods-section">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Graph 类方法
          </h3>
          <Table
            columns={graphMethodsColumns}
            dataSource={graphMethodsData}
            pagination={false}
          />
        </div>
      </div>
    </Panel>
  );

  return (
    <div ref={mainContainerRef} style={{ position: 'relative' }}>
      <div id="graph-example-title" style={{ height: '600px' }}>
        <PanelHeader title="图编辑器示例" />
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
        <Anchor
          affix={false}
          getContainer={() => document.body}
          onChange={(activeLink) => console.log('锚点切换:', activeLink)}
        >
          <Anchor.Link href="#graph-example-title" title="图编辑器示例" />
          <Anchor.Link href="#graph-options-section" title="GraphOptions" />
          <Anchor.Link href="#graph-methods-section" title="Graph 类方法" />
        </Anchor>
      </div>
    </div>
  );
};

export default GraphExample;
