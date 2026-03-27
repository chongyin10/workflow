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

// Selection 配置表格
const selectionConfigColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const selectionConfigData = [
  { name: 'enabled', type: 'boolean', default: 'true', description: '是否启用框选' },
  { name: 'multiple', type: 'boolean', default: 'true', description: '是否允许多选' },
  { name: 'selectionBoxStyle.strokeColor', type: 'string', default: "'#3b82f6'", description: '选择框边框颜色' },
  { name: 'selectionBoxStyle.strokeWidth', type: 'number', default: '2', description: '选择框边框宽度' },
  { name: 'selectionBoxStyle.fillColor', type: 'string', default: "'rgba(59, 130, 246, 0.1)'", description: '选择框填充颜色' },
  { name: 'onSelectionStart', type: '(e: SelectionEvent) => void', default: '-', description: '框选开始回调' },
  { name: 'onSelectionMove', type: '(e: SelectionEvent) => void', default: '-', description: '框选中回调' },
  { name: 'onSelectionEnd', type: '(e: SelectionEvent) => void', default: '-', description: '框选结束回调' },
];

// Selection 事件类型表格
const selectionEventColumns = [
  { title: '事件类型', dataIndex: 'type', width: 180 },
  { title: '说明', dataIndex: 'description' },
];

const selectionEventData = [
  { type: 'selection:start', description: '开始框选时触发' },
  { type: 'selection:move', description: '框选过程中触发' },
  { type: 'selection:end', description: '结束框选时触发' },
];

// 示例 1: 基础框选
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建框选插件
const selection = new Selection({
  enabled: true,
  multiple: true,
  selectionBoxStyle: {
    strokeColor: '#3b82f6',
    strokeWidth: 2,
    fillColor: 'rgba(59, 130, 246, 0.1)',
  },
  onSelectionStart: (e) => {
    console.log('开始框选');
  },
  onSelectionMove: (e) => {
    console.log('框选中，选中节点:', e.selectedNodes.length);
  },
  onSelectionEnd: (e) => {
    console.log('框选结束，选中节点:', e.selectedNodes.length);
  },
});

// 安装插件
graph.use(selection);

// 创建演示节点
const colors = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
];

for (let i = 0; i < 4; i++) {
  graph.addNode({
    id: 'node-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: 150 + (i % 2) * 250,
    y: 100 + Math.floor(i / 2) * 150,
    style: {
      width: 100,
      height: 80,
      backgroundColor: colors[i].bg,
      borderColor: colors[i].border,
      textColor: colors[i].text,
      borderRadius: 8,
      borderWidth: 2,
    },
  });
}

console.log('✅ 基础框选示例');
console.log('   - 按住 Alt + 鼠标左键拖动进行框选');
console.log('   - 支持多选：按住 Ctrl/Cmd 键可以追加选择');
console.log('   - 选中的节点会高亮显示');`;

// 示例 2: 自定义样式
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建框选插件（自定义样式）
const selection = new Selection({
  enabled: true,
  multiple: true,
  selectionBoxStyle: {
    strokeColor: '#10b981',  // 绿色边框
    strokeWidth: 3,
    fillColor: 'rgba(16, 185, 129, 0.15)',  // 绿色半透明填充
  },
  onSelectionEnd: (e) => {
    console.log('选中了', e.selectedNodes.length, '个节点');
  },
});

graph.use(selection);

// 创建演示节点
const positions = [
  { x: 100, y: 80 },
  { x: 250, y: 80 },
  { x: 400, y: 80 },
  { x: 550, y: 80 },
  { x: 175, y: 220 },
  { x: 475, y: 220 },
];

const colors = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'
];

positions.forEach((pos, i) => {
  graph.addNode({
    id: 'custom-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: pos.x,
    y: pos.y,
    style: {
      width: 100,
      height: 80,
      backgroundColor: colors[i],
      borderColor: colors[i],
      textColor: '#ffffff',
      borderRadius: 8,
      borderWidth: 2,
    },
  });
});

console.log('🎨 自定义样式框选');
console.log('   选择框使用绿色主题');
console.log('   - 按住 Alt + 鼠标左键拖动进行框选');`;

// 示例 3: 单选模式
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建框选插件（单选模式）
const selection = new Selection({
  enabled: true,
  multiple: false,  // 禁用多选，每次只能选中一个节点
  selectionBoxStyle: {
    strokeColor: '#8b5cf6',
    strokeWidth: 2,
    fillColor: 'rgba(139, 92, 246, 0.1)',
  },
  onSelectionEnd: (e) => {
    console.log('选中节点:', e.selectedNodes.map(n => n.getId()));
  },
});

graph.use(selection);

// 创建节点
for (let i = 0; i < 6; i++) {
  graph.addNode({
    id: 'single-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: 100 + (i % 3) * 200,
    y: 80 + Math.floor(i / 3) * 180,
    style: {
      width: 120,
      height: 100,
      backgroundColor: '#f1f5f9',
      borderColor: '#94a3b8',
      textColor: '#334155',
      borderRadius: 12,
      borderWidth: 2,
    },
  });
}

console.log('☝️ 单选模式示例');
console.log('   - multiple: false');
console.log('   - 每次只能选中一个节点');
console.log('   - 新的选择会替换之前的选中');
console.log('   - 按住 Alt + 鼠标左键拖动进行框选');`;

// 示例 4: 事件监听与动态控制
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建框选插件
const selection = new Selection({
  enabled: true,
  multiple: true,
  onSelectionStart: (e) => {
    console.log('🖱️ 框选开始', e);
  },
  onSelectionMove: (e) => {
    const bounds = e.bounds;
    if (bounds) {
      console.log('📦 选择框:', 
        'x:', Math.round(bounds.x), 
        'y:', Math.round(bounds.y),
        'width:', Math.round(bounds.width),
        'height:', Math.round(bounds.height)
      );
    }
  },
  onSelectionEnd: (e) => {
    console.log('✅ 框选结束');
    console.log('   选中节点数:', e.selectedNodes.length);
    console.log('   选中节点ID:', e.selectedNodes.map(n => n.getId()));
  },
});

graph.use(selection);

// 创建节点
const nodes = [
  { id: 'event-1', x: 120, y: 100, label: '左上' },
  { id: 'event-2', x: 400, y: 100, label: '中上' },
  { id: 'event-3', x: 580, y: 100, label: '右上' },
  { id: 'event-4', x: 120, y: 260, label: '左下' },
  { id: 'event-5', x: 400, y: 260, label: '中下' },
  { id: 'event-6', x: 580, y: 260, label: '右下' },
];

nodes.forEach((node, i) => {
  graph.addNode({
    id: node.id,
    label: node.label,
    x: node.x,
    y: node.y,
    style: {
      width: 100,
      height: 80,
      backgroundColor: '#ffffff',
      borderColor: i % 2 === 0 ? '#3b82f6' : '#22c55e',
      textColor: '#334155',
      borderRadius: 8,
      borderWidth: 2,
    },
  });
});

console.log('📊 事件监听示例');
console.log('   查看控制台输出框选过程中的事件信息');
console.log('   - 按住 Alt + 鼠标左键拖动进行框选');
console.log('');
console.log('   API 方法:');
console.log('   - selection.enable()     // 启用框选');
console.log('   - selection.disable()    // 禁用框选');
console.log('   - selection.setEnabled(boolean)');
console.log('   - selection.getSelectedNodes()  // 获取选中节点');
console.log('   - selection.clearSelection()    // 清除选择');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础框选', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '自定义样式', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '单选模式', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '事件监听', code: EXAMPLE_4_CODE },
];

export const SelectionExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);

  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph } = await import('../core');
      const { Selection } = await import('../plugins');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Selection,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Selection } = sandbox;
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
      <PanelHeader icon="🖱️" title="框选演示" hint="按住 Alt + 鼠标左键拖动进行框选" />
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
        <div id="selection-config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Selection 配置选项
          </h3>
          <Table columns={selectionConfigColumns} dataSource={selectionConfigData} pagination={false} />
        </div>
        <div id="selection-event-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            事件类型
          </h3>
          <Table columns={selectionEventColumns} dataSource={selectionEventData} pagination={false} />
        </div>
        <div id="selection-api-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            API 方法
          </h3>
          <Table
            columns={[
              { title: '方法名', dataIndex: 'method', width: 250 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={[
              { method: 'graph.use(selection)', description: '安装框选插件到 Graph 实例' },
              { method: 'selection.enable()', description: '启用框选功能' },
              { method: 'selection.disable()', description: '禁用框选功能' },
              { method: 'selection.setEnabled(enabled)', description: '设置是否启用框选' },
              { method: 'selection.getSelectedNodes()', description: '获取当前选中的节点数组' },
              { method: 'selection.clearSelection()', description: '清除所有选中状态' },
            ]}
            pagination={false}
          />
        </div>
        <div id="selection-usage-tips">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>触发方式：</strong>按住 Alt + 鼠标左键在画布空白处拖动进行框选</li>
            <li><strong>多选模式：</strong>按住 Ctrl/Cmd 键可以追加选择，否则会清空之前的选择</li>
            <li><strong>选择判定：</strong>与选择框相交或包含在内的节点都会被选中</li>
            <li><strong>样式定制：</strong>支持自定义选择框的边框颜色、宽度和填充颜色</li>
            <li><strong>事件监听：</strong>可以通过 onSelectionStart/Move/End 监听框选过程</li>
            <li><strong>动态控制：</strong>可以在运行时启用或禁用框选功能</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '600px' }}>
        <PanelHeader title="Selection 框选插件示例" />
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
          <Anchor.Link href="#selection-example-title" title="Selection 框选示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#selection-config-section" title="配置选项" />
          <Anchor.Link href="#selection-event-section" title="事件类型" />
          <Anchor.Link href="#selection-api-section" title="API 方法" />
          <Anchor.Link href="#selection-usage-tips" title="使用提示" />
        </Anchor>
      </div>
    </div>
  );
};

export default SelectionExample;
