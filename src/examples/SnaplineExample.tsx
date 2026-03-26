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

// Snapline 配置表格
const snaplineConfigColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const snaplineConfigData = [
  { name: 'enabled', type: 'boolean', default: 'true', description: '是否启用对齐线' },
  { name: 'tolerance', type: 'number', default: '10', description: '对齐容差（像素），节点在此范围内触发对齐线' },
  { name: 'lineColor', type: 'string', default: "'#3b82f6'", description: '对齐线颜色' },
  { name: 'lineWidth', type: 'number', default: '1', description: '对齐线宽度' },
  { name: 'lineDash', type: 'number[]', default: '[4, 4]', description: '虚线样式' },
  { name: 'showCenter', type: 'boolean', default: 'true', description: '是否显示居中对齐线' },
  { name: 'showEdge', type: 'boolean', default: 'true', description: '是否显示边缘对齐线' },
  { name: 'snap', type: 'boolean', default: 'false', description: '是否启用吸附功能' },
  { name: 'snapStrength', type: 'number', default: '5', description: '吸附强度（像素）' },
  { name: 'filter', type: '(snapline) => boolean', default: '() => true', description: '对齐线过滤函数' },
  { name: 'onSnaplineShow', type: '(snaplines) => void', default: '-', description: '对齐线显示回调' },
  { name: 'onSnaplineHide', type: '() => void', default: '-', description: '对齐线隐藏回调' },
];

// 对齐线类型表格
const snaplineTypeColumns = [
  { title: '对齐类型', dataIndex: 'type', width: 150 },
  { title: '方向', dataIndex: 'direction', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const snaplineTypeData = [
  { type: '左边缘对齐', direction: '垂直', description: '节点左边缘与其他节点左边缘对齐' },
  { type: '右边缘对齐', direction: '垂直', description: '节点右边缘与其他节点右边缘对齐' },
  { type: '水平居中对齐', direction: '垂直', description: '节点水平中心与其他节点水平中心对齐' },
  { type: '上边缘对齐', direction: '水平', description: '节点上边缘与其他节点上边缘对齐' },
  { type: '下边缘对齐', direction: '水平', description: '节点下边缘与其他节点下边缘对齐' },
  { type: '垂直居中对齐', direction: '水平', description: '节点垂直中心与其他节点垂直中心对齐' },
];

// 示例 1: 基础对齐线
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建对齐线插件
const snapline = new Snapline({
  enabled: true,
  tolerance: 5,      // 减小容差，需要更接近才触发对齐线
  lineColor: '#34d399',
  lineWidth: 2,
  lineDash: [6, 4],
  showCenter: true,
  showEdge: true,
});

// 安装插件
graph.use(snapline);

// 创建演示节点
graph.addNode({
  id: 'hello',
  label: 'Hello',
  x: 150,
  y: 120,
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

graph.addNode({
  id: 'drag-me',
  label: 'Drag Me',
  x: 450,
  y: 120,
  style: {
    width: 120,
    height: 50,
    backgroundColor: '#ffffff',
    borderColor: '#94a3b8',
    textColor: '#334155',
    borderRadius: 6,
    borderWidth: 1.5,
  },
});

graph.addNode({
  id: 'world',
  label: 'World',
  x: 300,
  y: 280,
  style: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderColor: '#94a3b8',
    textColor: '#334155',
    borderRadius: 40,
    borderWidth: 1.5,
    shape: 'circle',
  },
});

graph.addEdge({
  id: 'edge-1',
  source: 'hello',
  target: 'world',
  style: {
    stroke: '#94a3b8',
    strokeWidth: 1.5,
  },
});

console.log('✅ 基础对齐线示例');
console.log('   拖动 "Drag Me" 节点，观察对齐线效果');
console.log('   容差值: 5px（需要更接近才触发）');`;

// 示例 2: 吸附功能
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建对齐线插件（启用吸附）
const snapline = new Snapline({
  enabled: true,
  tolerance: 15,
  lineColor: '#ef4444',
  lineWidth: 2,
  lineDash: [6, 3],
  showCenter: true,
  showEdge: true,
  snap: true,
  snapStrength: 8,
  onSnaplineShow: (snaplines) => {
    console.log('显示对齐线:', snaplines.length, '条');
  },
  onSnaplineHide: () => {
    console.log('对齐线已隐藏');
  },
});

graph.use(snapline);

// 创建节点
const colors = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
];

for (let i = 0; i < 3; i++) {
  graph.addNode({
    id: 'snap-node-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: 120 + i * 200,
    y: 150,
    style: {
      width: 120,
      height: 80,
      backgroundColor: colors[i].bg,
      borderColor: colors[i].border,
      textColor: colors[i].text,
      borderRadius: 8,
      borderWidth: 2,
    },
  });
}

console.log('🧲 带吸附功能的对齐线');
console.log('   - 拖拽节点靠近其他节点时会自动吸附');
console.log('   - 吸附强度: 8px');`;

// 示例 3: 居中对齐
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建对齐线插件（只显示居中对齐线）
const snapline = new Snapline({
  enabled: true,
  tolerance: 12,
  lineColor: '#8b5cf6',
  lineWidth: 2,
  lineDash: [8, 4],
  showCenter: true,
  showEdge: false,
});

graph.use(snapline);

// 创建不同大小的节点
graph.addNode({
  id: 'center-1',
  label: '大节点',
  x: 150,
  y: 200,
  style: {
    width: 180,
    height: 120,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
    borderRadius: 12,
    borderWidth: 2,
  },
});

graph.addNode({
  id: 'center-2',
  label: '中节点',
  x: 400,
  y: 200,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
    borderRadius: 8,
    borderWidth: 2,
  },
});

graph.addNode({
  id: 'center-3',
  label: '小节点',
  x: 580,
  y: 200,
  style: {
    width: 80,
    height: 60,
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#166534',
    borderRadius: 6,
    borderWidth: 2,
  },
});

console.log('📍 只显示居中对齐线');
console.log('   - showCenter: true');
console.log('   - showEdge: false');`;

// 示例 4: 过滤器和动态控制
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建对齐线插件（只显示水平对齐线）
const snapline = new Snapline({
  enabled: true,
  tolerance: 10,
  lineColor: '#3b82f6',
  lineWidth: 2,
  lineDash: [4, 4],
  showCenter: true,
  showEdge: true,
  filter: (snapline) => snapline.type === 'horizontal',
});

graph.use(snapline);

// 创建节点
const positions = [
  { x: 100, y: 100 },
  { x: 300, y: 150 },
  { x: 500, y: 100 },
  { x: 200, y: 280 },
  { x: 450, y: 280 },
];

const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];

positions.forEach((pos, i) => {
  graph.addNode({
    id: 'filter-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: pos.x,
    y: pos.y,
    style: {
      width: 100,
      height: 60,
      backgroundColor: colors[i],
      borderColor: colors[i],
      textColor: '#ffffff',
      borderRadius: 8,
    },
  });
});

console.log('🎮 动态控制对齐线');
console.log('   当前只显示水平对齐线');
console.log('');
console.log('   可用 API:');
console.log('   - snapline.enable()');
console.log('   - snapline.disable()');
console.log('   - snapline.setOptions({ ... })');
console.log('   - snapline.clear()');`;

// 示例 5: 对齐线优先级演示
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建对齐线插件
const snapline = new Snapline({
  enabled: true,
  tolerance: 10,
  lineColor: '#10b981',
  lineWidth: 2,
  lineDash: [6, 4],
  showCenter: true,
  showEdge: true,
});

graph.use(snapline);

// 创建两个高度相同的节点
graph.addNode({
  id: 'node-a',
  label: '节点 A',
  x: 150,
  y: 150,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#ffffff',
    borderColor: '#64748b',
    textColor: '#334155',
    borderRadius: 6,
    borderWidth: 1.5,
  },
});

graph.addNode({
  id: 'node-b',
  label: '拖动我',
  x: 450,
  y: 150,
  style: {
    width: 120,
    height: 80,
    backgroundColor: '#ffffff',
    borderColor: '#3b82f6',
    textColor: '#334155',
    borderRadius: 6,
    borderWidth: 2,
  },
});

console.log('🎯 对齐线优先级演示');
console.log('');
console.log('   行为说明：');
console.log('   - 当中心点对齐时，只显示居中对齐线');
console.log('   - 当边缘对齐时，只显示边缘对齐线');
console.log('   - 不会同时显示居中和边缘对齐线');
console.log('');
console.log('   测试方法：');
console.log('   1. 上下拖动"拖动我"节点');
console.log('   2. 中心对齐时只显示中间一条线');
console.log('   3. 边缘对齐时只显示边缘线');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础对齐线', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '吸附功能', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '居中对齐', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '动态控制', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '对齐优先级', code: EXAMPLE_5_CODE },
];

export const SnaplineExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph } = await import('../core');
      const { Snapline } = await import('../plugins');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Snapline,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Snapline } = sandbox;
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
      <PanelHeader icon="📏" title="对齐线演示" hint="拖拽节点查看对齐效果" />
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
        <div id="snapline-config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Snapline 配置选项
          </h3>
          <Table columns={snaplineConfigColumns} dataSource={snaplineConfigData} pagination={false} />
        </div>
        <div id="snapline-type-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            对齐线类型
          </h3>
          <Table columns={snaplineTypeColumns} dataSource={snaplineTypeData} pagination={false} />
        </div>
        <div id="snapline-api-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            API 方法
          </h3>
          <Table
            columns={[
              { title: '方法名', dataIndex: 'method', width: 250 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={[
              { method: 'graph.use(snapline)', description: '安装对齐线插件到 Graph 实例' },
              { method: 'snapline.enable()', description: '启用对齐线功能' },
              { method: 'snapline.disable()', description: '禁用对齐线功能' },
              { method: 'snapline.isEnabled()', description: '获取对齐线是否启用' },
              { method: 'snapline.setOptions(options)', description: '更新对齐线配置' },
              { method: 'snapline.getOptions()', description: '获取当前配置' },
              { method: 'snapline.getSnaplines()', description: '获取当前显示的对齐线' },
              { method: 'snapline.isShowing()', description: '是否正在显示对齐线' },
              { method: 'snapline.update(node)', description: '手动触发对齐线计算' },
              { method: 'snapline.clear()', description: '清除对齐线' },
            ]}
            pagination={false}
          />
        </div>
        <div id="snapline-usage-tips">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>对齐容差：</strong>tolerance 决定了触发对齐线的距离范围，值越大越容易触发</li>
            <li><strong>吸附功能：</strong>启用 snap 后，节点会自动吸附到对齐位置</li>
            <li><strong>自定义过滤：</strong>通过 filter 函数可以控制显示哪些对齐线</li>
            <li><strong>事件回调：</strong>onSnaplineShow 和 onSnaplineHide 可用于自定义行为</li>
            <li><strong>动态控制：</strong>可以在运行时通过 enable/disable 切换对齐线功能</li>
            <li><strong>样式定制：</strong>支持自定义对齐线颜色、宽度、虚线样式</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '600px' }}>
        <PanelHeader title="Snapline 对齐线插件示例" />
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
          <Anchor.Link href="#snapline-example-title" title="Snapline 对齐线示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#snapline-config-section" title="配置选项" />
          <Anchor.Link href="#snapline-type-section" title="对齐线类型" />
          <Anchor.Link href="#snapline-api-section" title="API 方法" />
          <Anchor.Link href="#snapline-usage-tips" title="使用提示" />
        </Anchor>
      </div>
    </div>
  );
};

export default SnaplineExample;
