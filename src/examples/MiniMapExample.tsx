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

// MiniMap 配置表格
const miniMapConfigColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const miniMapConfigData = [
  { name: 'enabled', type: 'boolean', default: 'true', description: '是否启用小地图' },
  { name: 'width', type: 'number', default: '200', description: '小地图宽度（像素）' },
  { name: 'height', type: 'number', default: '150', description: '小地图高度（像素）' },
  { name: 'position', type: 'MiniMapPosition', default: "'bottom-right'", description: '小地图位置：top-left | top-right | bottom-left | bottom-right' },
  { name: 'backgroundColor', type: 'string', default: "'#ffffff'", description: '小地图背景颜色' },
  { name: 'borderColor', type: 'string', default: "'#e5e7eb'", description: '小地图边框颜色' },
  { name: 'borderWidth', type: 'number', default: '1', description: '小地图边框宽度' },
  { name: 'borderRadius', type: 'number', default: '4', description: '小地图圆角' },
  { name: 'viewportFillColor', type: 'string', default: "'rgba(0, 123, 255, 0.1)'", description: '视口矩形填充颜色' },
  { name: 'viewportBorderColor', type: 'string', default: "'#007bff'", description: '视口矩形边框颜色' },
  { name: 'viewportBorderWidth', type: 'number', default: '2', description: '视口矩形边框宽度' },
  { name: 'nodeColor', type: 'string', default: "'#4b5563'", description: '节点在小地图中的颜色' },
  { name: 'edgeColor', type: 'string', default: "'#9ca3af'", description: '边在小地图中的颜色' },
  { name: 'showViewport', type: 'boolean', default: 'true', description: '是否显示视口矩形' },
  { name: 'draggable', type: 'boolean', default: 'true', description: '是否允许拖拽视口移动画布' },
  { name: 'scalable', type: 'boolean', default: 'true', description: '是否允许滚轮缩放画布' },
  { name: 'padding', type: 'number', default: '20', description: '小地图内边距' },
  { name: 'opacity', type: 'number', default: '0.9', description: '小地图透明度' },
  { name: 'zIndex', type: 'number', default: '1000', description: '小地图层级' },
  { name: 'onViewportChange', type: '(transform) => void', default: '-', description: '视口变化回调' },
];

// 交互方式表格
const interactionColumns = [
  { title: '操作', dataIndex: 'action', width: 150 },
  { title: '方式', dataIndex: 'method', width: 150 },
  { title: '说明', dataIndex: 'description' },
];

const interactionData = [
  { action: '移动画布', method: '拖拽视口', description: '在小地图中拖拽蓝色视口矩形来移动主画布' },
  { action: '移动画布', method: '点击位置', description: '点击小地图中的任意位置，视口会移动到该位置' },
  { action: '缩放画布', method: '滚轮缩放', description: '在小地图上使用鼠标滚轮来缩放主画布' },
];

// 示例 1: 基础小地图
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建小地图插件（使用默认配置）
const miniMap = new MiniMap({
  enabled: true,
  width: 200,
  height: 150,
  position: 'bottom-right',
});

// 安装插件
graph.use(miniMap);

// 创建演示节点
graph.addNode({
  id: 'node-1',
  label: '节点 1',
  x: 100,
  y: 100,
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

graph.addNode({
  id: 'node-2',
  label: '节点 2',
  x: 350,
  y: 100,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#166534',
    borderRadius: 8,
    borderWidth: 2,
  },
});

graph.addNode({
  id: 'node-3',
  label: '节点 3',
  x: 225,
  y: 250,
  style: {
    width: 120,
    height: 60,
    backgroundColor: '#fef3c7',
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
  source: 'node-1',
  target: 'node-3',
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2,
  },
});

graph.addEdge({
  id: 'edge-3',
  source: 'node-2',
  target: 'node-3',
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2,
  },
});

console.log('✅ 基础小地图示例');
console.log('   - 右下角显示小地图');
console.log('   - 拖拽蓝色视口矩形移动画布');
console.log('   - 点击小地图任意位置跳转');`;

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

// 创建自定义样式的小地图插件
const miniMap = new MiniMap({
  enabled: true,
  width: 180,
  height: 120,
  position: 'top-left',
  backgroundColor: '#0f172a',
  borderColor: '#475569',
  borderWidth: 2,
  borderRadius: 8,
  viewportFillColor: 'rgba(59, 130, 246, 0.2)',
  viewportBorderColor: '#3b82f6',
  viewportBorderWidth: 2,
  nodeColor: '#60a5fa',
  edgeColor: '#475569',
  opacity: 0.95,
});

// 安装插件
graph.use(miniMap);

// 创建演示节点（深色主题）
graph.addNode({
  id: 'start',
  label: '开始',
  x: 80,
  y: 180,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#1e3a5f',
    borderColor: '#3b82f6',
    textColor: '#93c5fd',
    borderRadius: 25,
    borderWidth: 2,
  },
});

graph.addNode({
  id: 'process',
  label: '处理',
  x: 280,
  y: 180,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#1e3a5f',
    borderColor: '#3b82f6',
    textColor: '#93c5fd',
    borderRadius: 8,
    borderWidth: 2,
  },
});

graph.addNode({
  id: 'end',
  label: '结束',
  x: 480,
  y: 180,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#1e3a5f',
    borderColor: '#3b82f6',
    textColor: '#93c5fd',
    borderRadius: 25,
    borderWidth: 2,
  },
});

graph.addEdge({
  id: 'edge-1',
  source: 'start',
  target: 'process',
  type: EdgeType.Straight,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 2,
  },
});

graph.addEdge({
  id: 'edge-2',
  source: 'process',
  target: 'end',
  type: EdgeType.Straight,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 2,
  },
});

console.log('✅ 自定义样式小地图示例');
console.log('   - 左上角显示小地图');
console.log('   - 深色主题样式');`;

// 示例 3: 多位置演示
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 当前位置索引
let currentPosition = 0;
const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

// 创建小地图插件
const miniMap = new MiniMap({
  enabled: true,
  width: 160,
  height: 120,
  position: positions[currentPosition] as any,
  backgroundColor: '#ffffff',
  borderColor: '#3b82f6',
  borderWidth: 2,
  borderRadius: 8,
  viewportFillColor: 'rgba(59, 130, 246, 0.15)',
  viewportBorderColor: '#3b82f6',
  nodeColor: '#3b82f6',
  edgeColor: '#93c5fd',
});

// 安装插件
graph.use(miniMap);

// 切换位置的函数
window._toggleMiniMapPosition = () => {
  currentPosition = (currentPosition + 1) % positions.length;
  miniMap.setOptions({ position: positions[currentPosition] as any });
  console.log('📍 小地图位置:', positions[currentPosition]);
};

// 创建网格节点
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    graph.addNode({
      id: \`node-\${i}-\${j}\`,
      label: \`节点 \${i * 3 + j + 1}\`,
      x: 100 + j * 180,
      y: 80 + i * 120,
      style: {
        width: 100,
        height: 50,
        backgroundColor: '#ffffff',
        borderColor: '#94a3b8',
        textColor: '#334155',
        borderRadius: 6,
        borderWidth: 1.5,
      },
    });
  }
}

// 创建边
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 2; j++) {
    graph.addEdge({
      id: \`edge-h-\${i}-\${j}\`,
      source: \`node-\${i}-\${j}\`,
      target: \`node-\${i}-\${j + 1}\`,
      style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    });
  }
}

for (let i = 0; i < 2; i++) {
  for (let j = 0; j < 3; j++) {
    graph.addEdge({
      id: \`edge-v-\${i}-\${j}\`,
      source: \`node-\${i}-\${j}\`,
      target: \`node-\${i + 1}-\${j}\`,
      style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    });
  }
}

console.log('✅ 多位置演示示例');
console.log('   - 点击按钮切换小地图位置');
console.log('   - 当前位置:', positions[currentPosition]);`;

// 示例 4: 视口变化监听
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建带回调的小地图插件
const miniMap = new MiniMap({
  enabled: true,
  width: 200,
  height: 150,
  position: 'bottom-right',
  onViewportChange: (transform) => {
    console.log('📍 视口变化:', {
      offset: \`(\${Math.round(transform.offset.x)}, \${Math.round(transform.offset.y)})\`,
      scale: transform.scale.toFixed(2),
    });
  },
});

// 安装插件
graph.use(miniMap);

// 创建大量节点演示
const colors = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3' },
];

for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 4; j++) {
    const color = colors[i];
    graph.addNode({
      id: \`node-\${i}-\${j}\`,
      label: \`N\${i * 4 + j + 1}\`,
      x: 50 + j * 160,
      y: 50 + i * 80,
      style: {
        width: 80,
        height: 40,
        backgroundColor: color.bg,
        borderColor: color.border,
        textColor: color.text,
        borderRadius: 6,
        borderWidth: 2,
      },
    });
  }
}

console.log('✅ 视口变化监听示例');
console.log('   - 拖拽或缩放时查看控制台输出');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础小地图', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '自定义样式', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '多位置演示', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '视口监听', code: EXAMPLE_4_CODE },
];

export const MiniMapExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const graphRef = useRef<any>(null);

  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph } = await import('../core');
      const { MiniMap } = await import('../plugins');
      const { EdgeType } = await import('../core/Edge');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        MiniMap,
        EdgeType,
        window,
        // 用于保存 graph 实例的回调
        _registerGraph: (graph: any) => {
          graphRef.current = graph;
        },
      };

      const executableCode = `'use strict';
        const { container, console, Graph, MiniMap, EdgeType, window, _registerGraph } = sandbox;
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

  // 切换位置按钮处理
  const handleTogglePosition = useCallback(() => {
    if ((window as any)._toggleMiniMapPosition) {
      (window as any)._toggleMiniMapPosition();
    }
  }, []);

  const LeftPanel = (
    <Panel>
      <PanelHeader icon="🗺️" title="小地图演示" hint="拖拽视口移动画布，滚轮缩放" />
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
        <div id="minimap-config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            MiniMap 配置选项
          </h3>
          <Table columns={miniMapConfigColumns} dataSource={miniMapConfigData} pagination={false} />
        </div>
        <div id="minimap-interaction-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            交互方式
          </h3>
          <Table columns={interactionColumns} dataSource={interactionData} pagination={false} />
        </div>
        <div id="minimap-api-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            API 方法
          </h3>
          <Table
            columns={[
              { title: '方法名', dataIndex: 'method', width: 280 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={[
              { method: 'graph.use(miniMap)', description: '安装小地图插件到 Graph 实例' },
              { method: 'miniMap.render()', description: '手动刷新小地图' },
              { method: 'miniMap.setOptions(options)', description: '更新小地图配置' },
              { method: 'miniMap.show()', description: '显示小地图' },
              { method: 'miniMap.hide()', description: '隐藏小地图' },
              { method: 'miniMap.getContainer()', description: '获取小地图容器元素' },
              { method: 'miniMap.getCanvas()', description: '获取小地图画布元素' },
            ]}
            pagination={false}
          />
        </div>
        <div id="minimap-position-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            位置选项
          </h3>
          <Table
            columns={[
              { title: '位置值', dataIndex: 'value', width: 150 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={[
              { value: "'top-left'", description: '左上角' },
              { value: "'top-right'", description: '右上角' },
              { value: "'bottom-left'", description: '左下角' },
              { value: "'bottom-right'", description: '右下角（默认）' },
            ]}
            pagination={false}
          />
        </div>
        <div id="minimap-usage-tips">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>移动画布：</strong>拖拽小地图中的蓝色视口矩形</li>
            <li><strong>快速定位：</strong>点击小地图任意位置，视口会移动到该位置</li>
            <li><strong>缩放画布：</strong>在小地图上使用鼠标滚轮</li>
            <li><strong>自定义位置：</strong>通过 position 属性设置小地图位置</li>
            <li><strong>自定义样式：</strong>支持自定义背景色、边框、视口颜色等</li>
            <li><strong>视口监听：</strong>通过 onViewportChange 回调监听视口变化</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '600px' }}>
        <PanelHeader title="MiniMap 小地图插件示例" />
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
          {currentExample === 2 && (
            <button
              onClick={handleTogglePosition}
              style={{
                padding: '6px 16px',
                background: '#22c55e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                marginLeft: '8px',
              }}
            >
              🔄 切换位置
            </button>
          )}
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
          <Anchor.Link href="#minimap-example-title" title="MiniMap 小地图示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#minimap-config-section" title="配置选项" />
          <Anchor.Link href="#minimap-interaction-section" title="交互方式" />
          <Anchor.Link href="#minimap-api-section" title="API 方法" />
          <Anchor.Link href="#minimap-position-section" title="位置选项" />
          <Anchor.Link href="#minimap-usage-tips" title="使用提示" />
        </Anchor>
      </div>
    </div>
  );
};

export default MiniMapExample;
