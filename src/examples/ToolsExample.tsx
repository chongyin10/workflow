import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Splitter, Table, Button } from '@zjpcy/simple-design';
import {
  CodeEditor,
  Panel,
  PanelHeader,
  PanelContent,
  PanelToolbar,
} from './components/CodeEditor';
import './styles/panel.css';

// Tools 配置表格
const toolsConfigColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const toolsConfigData = [
  { name: 'enabled', type: 'boolean', default: 'true', description: '是否启用工具栏' },
  { name: 'width', type: 'number', default: '30', description: '工具栏宽度（像素）' },
  { name: 'height', type: 'number', default: '200', description: '工具栏高度（像素）' },
  { name: 'position', type: 'string', default: "'top-right'", description: '工具栏位置：top-right | top-left | bottom-right | bottom-left' },
  { name: 'backgroundColor', type: 'string', default: "'#ffffff'", description: '工具栏背景颜色' },
  { name: 'borderColor', type: 'string', default: "'#e5e7eb'", description: '工具栏边框颜色' },
  { name: 'borderRadius', type: 'number', default: '8', description: '工具栏圆角' },
  { name: 'boxShadow', type: 'string', default: "'0 2px 8px rgba(0, 0, 0, 0.15)'", description: '工具栏阴影' },
  { name: 'zIndex', type: 'number', default: '1000', description: '工具栏层级' },
  { name: 'showZoom', type: 'boolean', default: 'true', description: '是否显示缩放按钮' },
  { name: 'showDragToggle', type: 'boolean', default: 'true', description: '是否显示拖拽切换按钮' },
  { name: 'showHistory', type: 'boolean', default: 'true', description: '是否显示撤销/重做按钮' },
  { name: 'showSearch', type: 'boolean', default: 'true', description: '是否显示搜索框' },
  { name: 'zoomStep', type: 'number', default: '0.1', description: '缩放步长' },
  { name: 'onSearch', type: '(keyword, results) => void', default: '-', description: '搜索回调函数' },
  { name: 'onZoomChange', type: '(scale) => void', default: '-', description: '缩放变化回调' },
  { name: 'onDragToggle', type: '(enabled) => void', default: '-', description: '拖拽状态变化回调' },
];

// 工具栏功能表格
const toolsFeatureColumns = [
  { title: '功能', dataIndex: 'feature', width: 120 },
  { title: '图标', dataIndex: 'icon', width: 80 },
  { title: '说明', dataIndex: 'description' },
];

const toolsFeatureData = [
  { feature: '放大画布', icon: '🔍+', description: '点击放大画布，缩放比例增加 zoomStep' },
  { feature: '缩小画布', icon: '🔍-', description: '点击缩小画布，缩放比例减少 zoomStep' },
  { feature: '拖拽切换', icon: '✋', description: '切换画布拖拽功能的启用/禁用状态' },
  { feature: '撤销', icon: '↩️', description: '撤销上一步操作（需要 History 插件）' },
  { feature: '重做', icon: '↪️', description: '重做上一步操作（需要 History 插件）' },
  { feature: '搜索', icon: '🔎', description: '搜索节点或边，支持 ID 和标签匹配' },
];

// 示例 1: 基础工具栏
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建历史记录插件（用于撤销/重做功能）
const history = new History({
  enabled: true,
  maxStackSize: 50,
});

// 安装历史记录插件
graph.use(history);

// 创建工具栏插件
const tools = new Tools({
  enabled: true,
  width: 30,
  height: 200,
  position: 'top-right',
  showZoom: true,
  showDragToggle: true,
  showHistory: true,
  showSearch: false,
  zoomStep: 0.1,
  onSearch: (keyword, results) => {
    console.log('搜索关键词:', keyword);
    console.log('找到节点:', results.nodes.length, '个');
    console.log('找到边:', results.edges.length, '个');
  },
  onZoomChange: (scale) => {
    console.log('当前缩放比例:', scale.toFixed(2));
  },
  onDragToggle: (enabled) => {
    console.log('拖拽状态:', enabled ? '已启用' : '已禁用');
  },
});

// 安装工具栏插件
graph.use(tools);

// 设置 History 插件实例（用于撤销/重做功能）
tools.setHistoryPlugin(history);

// 创建演示节点
graph.addNode({
  id: 'node-1',
  label: '节点 1',
  x: 150,
  y: 150,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#ffffff',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
    borderRadius: 8,
    borderWidth: 2,
  },
});

graph.addNode({
  id: 'node-2',
  label: '节点 2',
  x: 350,
  y: 150,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#ffffff',
    borderColor: '#22c55e',
    textColor: '#166534',
    borderRadius: 8,
    borderWidth: 2,
  },
});

graph.addNode({
  id: 'node-3',
  label: '节点 3',
  x: 250,
  y: 280,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#ffffff',
    borderColor: '#f59e0b',
    textColor: '#92400e',
    borderRadius: 8,
    borderWidth: 2,
  },
});

graph.addEdge({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2,
  },
});

graph.addEdge({
  id: 'edge-2',
  source: 'node-2',
  target: 'node-3',
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2,
  },
});

console.log('✅ 基础工具栏示例');
console.log('   - 右上角显示工具栏');
console.log('   - 支持缩放、拖拽切换、撤销/重做、搜索功能');`;

// 示例 2: 自定义位置和样式
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#1e293b',
});

// 创建历史记录插件
const history = new History();
graph.use(history);

// 创建工具栏插件（自定义位置和样式）
const tools = new Tools({
  enabled: true,
  width: 30,
  height: 180,
  position: 'bottom-left',
  backgroundColor: '#334155',
  borderColor: '#475569',
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  showZoom: true,
  showDragToggle: true,
  showHistory: true,
  showSearch: false, // 隐藏搜索框
  zoomStep: 0.15,
});

graph.use(tools);
tools.setHistoryPlugin(history);

// 创建深色主题节点
const colors = [
  { bg: '#3b82f6', border: '#60a5fa' },
  { bg: '#22c55e', border: '#4ade80' },
  { bg: '#f59e0b', border: '#fbbf24' },
  { bg: '#ec4899', border: '#f472b6' },
];

for (let i = 0; i < 4; i++) {
  graph.addNode({
    id: 'dark-node-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: 100 + i * 150,
    y: 180,
    style: {
      width: 100,
      height: 50,
      backgroundColor: colors[i].bg,
      borderColor: colors[i].border,
      textColor: '#ffffff',
      borderRadius: 8,
      borderWidth: 2,
    },
  });
}

console.log('🎨 自定义样式工具栏');
console.log('   - 位置：左下角');
console.log('   - 深色主题');
console.log('   - 隐藏搜索框');`;

// 示例 3: 部分功能
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 只启用缩放和搜索功能
const tools = new Tools({
  enabled: true,
  width: 30,
  height: 120,
  position: 'top-right',
  showZoom: true,
  showDragToggle: false, // 禁用拖拽切换
  showHistory: false,    // 禁用撤销/重做
  showSearch: false,
  zoomStep: 0.2,
  onSearch: (keyword, results) => {
    // 高亮搜索结果
    tools.highlightSearchResults(results);
    
    // 如果只有一个结果，定位到该节点
    if (results.nodes.length === 1) {
      tools.focusNode(results.nodes[0].id);
    }
  },
});

graph.use(tools);

// 创建可搜索的节点
const nodeData = [
  { id: 'start', label: '开始', x: 100, y: 200, color: '#22c55e' },
  { id: 'process-1', label: '处理数据', x: 250, y: 100, color: '#3b82f6' },
  { id: 'process-2', label: '验证数据', x: 250, y: 300, color: '#3b82f6' },
  { id: 'decision', label: '判断条件', x: 400, y: 200, color: '#f59e0b' },
  { id: 'end', label: '结束', x: 550, y: 200, color: '#ef4444' },
];

nodeData.forEach((data) => {
  graph.addNode({
    id: data.id,
    label: data.label,
    x: data.x,
    y: data.y,
    style: {
      width: 100,
      height: 50,
      backgroundColor: '#ffffff',
      borderColor: data.color,
      textColor: '#334155',
      borderRadius: 8,
      borderWidth: 2,
    },
  });
});

// 创建连接
graph.addEdge({ id: 'e1', source: 'start', target: 'process-1' });
graph.addEdge({ id: 'e2', source: 'start', target: 'process-2' });
graph.addEdge({ id: 'e3', source: 'process-1', target: 'decision' });
graph.addEdge({ id: 'e4', source: 'process-2', target: 'decision' });
graph.addEdge({ id: 'e5', source: 'decision', target: 'end' });

console.log('🔍 精简工具栏');
console.log('   - 只启用缩放和搜索功能');
console.log('   - 搜索时自动高亮结果');
console.log('   - 单个结果时自动定位');
console.log('');
console.log('   试试搜索: "数据" 或 "开始"');`;

// 示例 4: API 演示
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建历史记录插件
const history = new History();
graph.use(history);

// 创建工具栏插件
const tools = new Tools({
  showZoom: true,
  showDragToggle: true,
  showHistory: true,
  showSearch: false,
});

graph.use(tools);
tools.setHistoryPlugin(history);

// 创建节点
for (let i = 0; i < 5; i++) {
  graph.addNode({
    id: 'api-node-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: 100 + i * 120,
    y: 180,
    style: {
      width: 100,
      height: 50,
      backgroundColor: '#ffffff',
      borderColor: '#64748b',
      textColor: '#334155',
      borderRadius: 6,
      borderWidth: 1.5,
    },
  });
}

console.log('🎮 Tools API 演示');
console.log('');
console.log('   可用 API 方法:');
console.log('   - tools.zoomIn()          放大画布');
console.log('   - tools.zoomOut()         缩小画布');
console.log('   - tools.setZoom(scale)    设置缩放比例');
console.log('   - tools.getZoom()         获取当前缩放比例');
console.log('   - tools.toggleDrag(bool)  切换拖拽状态');
console.log('   - tools.undo()            撤销');
console.log('   - tools.redo()            重做');
console.log('   - tools.search(keyword)   搜索节点/边');
console.log('   - tools.focusNode(id)     定位到指定节点');
console.log('   - tools.enable()          启用工具栏');
console.log('   - tools.disable()         禁用工具栏');
console.log('');
console.log('   在控制台尝试这些方法！');`;

// 示例 5: 多位置工具栏
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f0fdf4',
});

// 创建历史记录插件
const history = new History();
graph.use(history);

// 创建右上角工具栏（完整功能）
const toolsRight = new Tools({
  position: 'top-right',
  width: 30,
  height: 200,
  showZoom: true,
  showDragToggle: true,
  showHistory: true,
  showSearch: false,
  backgroundColor: '#ffffff',
  borderColor: '#22c55e',
});

graph.use(toolsRight);
toolsRight.setHistoryPlugin(history);

// 创建演示节点
const positions = [
  { x: 150, y: 100, label: '用户输入', color: '#3b82f6' },
  { x: 350, y: 100, label: '数据处理', color: '#22c55e' },
  { x: 550, y: 100, label: '结果输出', color: '#f59e0b' },
  { x: 250, y: 250, label: '数据存储', color: '#8b5cf6' },
  { x: 450, y: 250, label: '日志记录', color: '#ec4899' },
];

positions.forEach((pos, i) => {
  graph.addNode({
    id: 'multi-node-' + (i + 1),
    label: pos.label,
    x: pos.x,
    y: pos.y,
    style: {
      width: 110,
      height: 50,
      backgroundColor: '#ffffff',
      borderColor: pos.color,
      textColor: '#334155',
      borderRadius: 8,
      borderWidth: 2,
    },
  });
});

// 创建边
graph.addEdge({ source: 'multi-node-1', target: 'multi-node-2' });
graph.addEdge({ source: 'multi-node-2', target: 'multi-node-3' });
graph.addEdge({ source: 'multi-node-2', target: 'multi-node-4' });
graph.addEdge({ source: 'multi-node-2', target: 'multi-node-5' });

console.log('📍 工具栏位置演示');
console.log('   - 当前位置：右上角 (top-right)');
console.log('');
console.log('   可用位置选项:');
console.log('   - top-right: 右上角（默认）');
console.log('   - top-left: 左上角');
console.log('   - bottom-right: 右下角');
console.log('   - bottom-left: 左下角');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础工具栏', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '自定义样式', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '精简功能', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: 'API 演示', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '位置选项', code: EXAMPLE_5_CODE },
];

export const ToolsExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph } = await import('../core');
      const { Tools, History } = await import('../plugins');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Tools,
        History,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Tools, History } = sandbox;
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
      <PanelHeader icon="🔧" title="工具栏演示" hint="使用右上角工具栏操作画布" />
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
        <div id="tools-config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Tools 配置选项
          </h3>
          <Table columns={toolsConfigColumns} dataSource={toolsConfigData} pagination={false} />
        </div>
        <div id="tools-feature-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            工具栏功能
          </h3>
          <Table columns={toolsFeatureColumns} dataSource={toolsFeatureData} pagination={false} />
        </div>
        <div id="tools-api-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            API 方法
          </h3>
          <Table
            columns={[
              { title: '方法名', dataIndex: 'method', width: 250 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={[
              { method: 'graph.use(tools)', description: '安装工具栏插件到 Graph 实例' },
              { method: 'tools.setHistoryPlugin(history)', description: '设置 History 插件实例（用于撤销/重做功能）' },
              { method: 'tools.zoomIn()', description: '放大画布' },
              { method: 'tools.zoomOut()', description: '缩小画布' },
              { method: 'tools.setZoom(scale)', description: '设置缩放比例' },
              { method: 'tools.getZoom()', description: '获取当前缩放比例' },
              { method: 'tools.toggleDrag(enabled?)', description: '切换拖拽状态，可选参数指定启用/禁用' },
              { method: 'tools.undo()', description: '撤销上一步操作（需要 History 插件）' },
              { method: 'tools.redo()', description: '重做上一步操作（需要 History 插件）' },
              { method: 'tools.canUndo()', description: '是否可以撤销' },
              { method: 'tools.canRedo()', description: '是否可以重做' },
              { method: 'tools.search(keyword)', description: '搜索节点或边，返回搜索结果' },
              { method: 'tools.highlightSearchResults(results)', description: '高亮搜索结果' },
              { method: 'tools.focusNode(nodeId)', description: '定位到指定节点' },
              { method: 'tools.enable()', description: '启用工具栏' },
              { method: 'tools.disable()', description: '禁用工具栏' },
              { method: 'tools.isEnabledState()', description: '获取工具栏是否启用' },
              { method: 'tools.setOptions(options)', description: '更新工具栏配置' },
              { method: 'tools.getOptions()', description: '获取当前配置' },
            ]}
            pagination={false}
          />
        </div>
        <div id="tools-usage-tips">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>撤销/重做功能：</strong>需要先安装 History 插件，然后通过 setHistoryPlugin 方法设置</li>
            <li><strong>搜索功能：</strong>支持搜索节点的 ID 和标签，可通过 onSearch 回调处理搜索结果</li>
            <li><strong>高亮结果：</strong>使用 highlightSearchResults 方法可以高亮显示搜索到的节点</li>
            <li><strong>定位节点：</strong>使用 focusNode 方法可以将画布定位到指定节点</li>
            <li><strong>自定义样式：</strong>支持自定义背景色、边框色、圆角、阴影等样式</li>
            <li><strong>位置选项：</strong>支持四个角落的位置：top-right、top-left、bottom-right、bottom-left</li>
            <li><strong>精简功能：</strong>可以通过 showZoom、showDragToggle、showHistory、showSearch 控制显示哪些功能</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '600px' }}>
        <PanelHeader title="Tools 工具栏插件示例" />
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
    </div>
  );
};

export default ToolsExample;
