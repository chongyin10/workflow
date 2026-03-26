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

// Clipboard 配置表格
const clipboardConfigColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const clipboardConfigData = [
  { name: 'enabled', type: 'boolean', default: 'true', description: '是否启用剪贴板' },
  { name: 'useSystemClipboard', type: 'boolean', default: 'false', description: '是否使用系统剪贴板' },
  { name: 'pasteOffset', type: 'number', default: '20', description: '粘贴时的偏移量（像素）' },
  { name: 'keepOriginalId', type: 'boolean', default: 'false', description: '是否在粘贴时保持原 ID' },
  { name: 'generateId', type: '() => string', default: 'UUID', description: '自定义 ID 生成函数' },
  { name: 'onBeforeCopy', type: '(data) => boolean | void', default: '-', description: '复制前回调，返回 false 取消' },
  { name: 'onCopy', type: '(data) => void', default: '-', description: '复制后回调' },
  { name: 'onBeforePaste', type: '(data) => boolean | ClipboardData | void', default: '-', description: '粘贴前回调' },
  { name: 'onPaste', type: '(nodes, edges) => void', default: '-', description: '粘贴后回调' },
  { name: 'onCut', type: '(data) => void', default: '-', description: '剪切后回调' },
  { name: 'onDelete', type: '(nodeIds, edgeIds) => void', default: '-', description: '删除后回调' },
];

// 快捷键表格
const shortcutColumns = [
  { title: '快捷键', dataIndex: 'shortcut', width: 150 },
  { title: '功能', dataIndex: 'action', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const shortcutData = [
  { shortcut: 'Ctrl+C / ⌘+C', action: '复制', description: '复制选中的节点或边' },
  { shortcut: 'Ctrl+V / ⌘+V', action: '粘贴', description: '粘贴剪贴板中的内容' },
  { shortcut: 'Ctrl+X / ⌘+X', action: '剪切', description: '剪切选中的节点或边' },
  { shortcut: 'Delete / Backspace', action: '删除', description: '删除选中的节点或边' },
  { shortcut: 'Ctrl+A / ⌘+A', action: '全选', description: '选中所有节点（当前仅支持单选）' },
];

// 示例 1: 基础剪贴板
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建剪贴板插件
const clipboard = new Clipboard({
  enabled: true,
  pasteOffset: 30,
  onCopy: (data) => {
    console.log('📋 已复制:', data.nodes.length, '个节点');
  },
  onPaste: (nodes, edges) => {
    console.log('📋 已粘贴:', nodes.length, '个节点');
  },
});

// 安装插件
graph.use(clipboard);

// 注册到外部（用于按钮操作）
if (typeof _registerClipboard === 'function') {
  _registerClipboard(clipboard, graph);
}

// 创建演示节点
graph.addNode({
  id: 'node-1',
  label: '节点 1',
  x: 150,
  y: 150,
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
  x: 400,
  y: 150,
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

graph.addEdge({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2,
  },
});

console.log('📋 基础剪贴板示例');
console.log('   1. 选中节点后按 Ctrl+C 复制');
console.log('   2. 按 Ctrl+V 粘贴');
console.log('   3. 按 Ctrl+X 剪切');
console.log('   4. 按 Delete 删除');`;

// 示例 2: 带回调的剪贴板
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建剪贴板插件（带完整回调）
const clipboard = new Clipboard({
  enabled: true,
  pasteOffset: 25,
  onBeforeCopy: (data) => {
    console.log('⏳ 准备复制...');
    // 返回 false 可以取消复制
    return true;
  },
  onCopy: (data) => {
    console.log('✅ 复制完成!');
    console.log('   节点数:', data.nodes.length);
    console.log('   边数:', data.edges.length);
  },
  onBeforePaste: (data) => {
    console.log('⏳ 准备粘贴...');
    // 可以修改粘贴数据
    return data;
  },
  onPaste: (nodes, edges) => {
    console.log('✅ 粘贴完成!');
    nodes.forEach(node => {
      console.log('   新节点:', node.getId(), node.getLabel());
    });
  },
  onCut: (data) => {
    console.log('✂️ 剪切完成!');
  },
  onDelete: (nodeIds, edgeIds) => {
    console.log('🗑️ 删除完成!');
    console.log('   删除节点:', nodeIds);
    console.log('   删除边:', edgeIds);
  },
});

graph.use(clipboard);

// 注册到外部（用于按钮操作）
if (typeof _registerClipboard === 'function') {
  _registerClipboard(clipboard, graph);
}

// 创建不同颜色的节点
const colors = [
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3' },
];

colors.forEach((color, i) => {
  graph.addNode({
    id: 'color-node-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: 100 + i * 200,
    y: 180,
    style: {
      width: 120,
      height: 60,
      backgroundColor: color.bg,
      borderColor: color.border,
      textColor: color.text,
      borderRadius: 8,
      borderWidth: 2,
    },
  });
});

console.log('📋 带回调的剪贴板示例');
console.log('   操作节点时会触发相应回调');`;

// 示例 3: 自定义 ID 生成
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 自定义 ID 计数器
let nodeIdCounter = 0;

// 创建剪贴板插件（自定义 ID 生成）
const clipboard = new Clipboard({
  enabled: true,
  pasteOffset: 40,
  // 自定义 ID 生成函数
  generateId: () => {
    nodeIdCounter++;
    return 'custom-node-' + nodeIdCounter + '-' + Date.now();
  },
  onPaste: (nodes) => {
    nodes.forEach(node => {
      console.log('🆔 新节点 ID:', node.getId());
    });
  },
});

graph.use(clipboard);

// 注册到外部（用于按钮操作）
if (typeof _registerClipboard === 'function') {
  _registerClipboard(clipboard, graph);
}

// 创建节点
graph.addNode({
  id: 'original-node',
  label: '原始节点',
  x: 300,
  y: 180,
  style: {
    width: 140,
    height: 70,
    backgroundColor: '#ffffff',
    borderColor: '#64748b',
    textColor: '#334155',
    borderRadius: 10,
    borderWidth: 2,
  },
});

console.log('📋 自定义 ID 生成示例');
console.log('   粘贴时会使用自定义 ID 生成函数');
console.log('   原始节点 ID: original-node');`;

// 示例 4: API 方法演示
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建剪贴板插件
const clipboard = new Clipboard({
  enabled: true,
  pasteOffset: 30,
});

graph.use(clipboard);

// 注册到外部（用于按钮操作）
if (typeof _registerClipboard === 'function') {
  _registerClipboard(clipboard, graph);
}

// 创建节点
graph.addNode({
  id: 'api-node-1',
  label: '节点 1',
  x: 150,
  y: 150,
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
  id: 'api-node-2',
  label: '节点 2',
  x: 400,
  y: 150,
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

console.log('📋 Clipboard API 方法演示');
console.log('');
console.log('   可用方法:');
console.log('   - clipboard.copy()       // 复制选中内容');
console.log('   - clipboard.paste()      // 粘贴');
console.log('   - clipboard.cut()        // 剪切');
console.log('   - clipboard.delete()     // 删除');
console.log('   - clipboard.clear()      // 清空剪贴板');
console.log('   - clipboard.hasContent() // 检查是否有内容');
console.log('   - clipboard.getClipboardData() // 获取剪贴板数据');
console.log('   - clipboard.toJSON()     // 导出为 JSON');
console.log('   - clipboard.enable()     // 启用');
console.log('   - clipboard.disable()    // 禁用');`;

// 示例 5: 复制带边的节点
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建剪贴板插件
const clipboard = new Clipboard({
  enabled: true,
  pasteOffset: 50,
  onPaste: (nodes, edges) => {
    console.log('📋 粘贴结果:');
    console.log('   节点:', nodes.map(n => n.getLabel()).join(', '));
    console.log('   边数:', edges.length);
  },
});

graph.use(clipboard);

// 注册到外部（用于按钮操作）
if (typeof _registerClipboard === 'function') {
  _registerClipboard(clipboard, graph);
}

// 创建连接的节点
graph.addNode({
  id: 'connected-1',
  label: '开始',
  x: 150,
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

graph.addNode({
  id: 'connected-2',
  label: '处理',
  x: 350,
  y: 180,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
    borderRadius: 8,
    borderWidth: 2,
  },
});

graph.addNode({
  id: 'connected-3',
  label: '结束',
  x: 550,
  y: 180,
  style: {
    width: 100,
    height: 50,
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    textColor: '#991b1b',
    borderRadius: 25,
    borderWidth: 2,
  },
});

// 创建边
graph.addEdge({
  id: 'conn-edge-1',
  source: 'connected-1',
  target: 'connected-2',
  type: 'straight',
  style: { stroke: '#94a3b8', strokeWidth: 2, arrowSize: 10 },
});

graph.addEdge({
  id: 'conn-edge-2',
  source: 'connected-2',
  target: 'connected-3',
  type: 'straight',
  style: { stroke: '#94a3b8', strokeWidth: 2, arrowSize: 10 },
});

console.log('📋 复制带边的节点');
console.log('');
console.log('   说明:');
console.log('   - 选中节点后复制');
console.log('   - 粘贴时会自动复制相关的边');
console.log('   - 边的源和目标节点必须都被复制');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础剪贴板', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '带回调', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '自定义ID', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: 'API方法', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '复制带边', code: EXAMPLE_5_CODE },
];

export const ClipboardExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const clipboardRef = useRef<any>(null);
  const graphRef = useRef<any>(null);

  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph } = await import('../core');
      const { Clipboard } = await import('../plugins');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        Clipboard,
        // 用于保存 clipboard 实例的回调
        _registerClipboard: (clipboard: any, graph: any) => {
          clipboardRef.current = clipboard;
          graphRef.current = graph;
        },
      };

      const executableCode = `'use strict';
        const { container, console, Graph, Clipboard, _registerClipboard } = sandbox;
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

  // 操作按钮处理函数
  const handleCopy = useCallback(() => {
    if (clipboardRef.current) {
      clipboardRef.current.copy();
    }
  }, []);

  const handlePaste = useCallback(() => {
    if (clipboardRef.current) {
      clipboardRef.current.paste();
    }
  }, []);

  const handleCut = useCallback(() => {
    if (clipboardRef.current) {
      clipboardRef.current.cut();
    }
  }, []);

  const handleDelete = useCallback(() => {
    if (clipboardRef.current) {
      clipboardRef.current.delete();
    }
  }, []);

  const handleClearClipboard = useCallback(() => {
    if (clipboardRef.current) {
      clipboardRef.current.clear();
      console.log('📋 剪贴板已清空');
    }
  }, []);

  const LeftPanel = (
    <Panel>
      <PanelHeader icon="📋" title="剪贴板演示" hint="选中节点后使用按钮或快捷键操作" />
      {/* 操作按钮工具栏 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 12px',
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Button size="small" onClick={handleCopy}>
          📋 复制
        </Button>
        <Button size="small" onClick={handlePaste}>
          📄 粘贴
        </Button>
        <Button size="small" onClick={handleCut}>
          ✂️ 剪切
        </Button>
        <Button size="small" onClick={handleDelete}>
          🗑️ 删除
        </Button>
        <Button size="small" onClick={handleClearClipboard}>
          🧹 清空剪贴板
        </Button>
      </div>
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
        <div id="clipboard-config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            Clipboard 配置选项
          </h3>
          <Table columns={clipboardConfigColumns} dataSource={clipboardConfigData} pagination={false} />
        </div>
        <div id="clipboard-shortcut-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            快捷键
          </h3>
          <Table columns={shortcutColumns} dataSource={shortcutData} pagination={false} />
        </div>
        <div id="clipboard-api-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            API 方法
          </h3>
          <Table
            columns={[
              { title: '方法名', dataIndex: 'method', width: 280 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={[
              { method: 'graph.use(clipboard)', description: '安装剪贴板插件到 Graph 实例' },
              { method: 'clipboard.copy()', description: '复制选中的节点或边' },
              { method: 'clipboard.paste()', description: '粘贴剪贴板中的内容' },
              { method: 'clipboard.cut()', description: '剪切选中的节点或边' },
              { method: 'clipboard.delete()', description: '删除选中的节点或边' },
              { method: 'clipboard.clear()', description: '清空剪贴板内容' },
              { method: 'clipboard.hasContent()', description: '检查剪贴板是否有内容' },
              { method: 'clipboard.getClipboardData()', description: '获取剪贴板数据' },
              { method: 'clipboard.setClipboardData(data)', description: '设置剪贴板数据' },
              { method: 'clipboard.toJSON()', description: '导出剪贴板数据为 JSON 字符串' },
              { method: 'clipboard.loadFromJSON(json)', description: '从 JSON 字符串加载剪贴板数据' },
              { method: 'clipboard.enable()', description: '启用剪贴板功能' },
              { method: 'clipboard.disable()', description: '禁用剪贴板功能' },
              { method: 'clipboard.isEnabled()', description: '获取剪贴板是否启用' },
              { method: 'clipboard.setOptions(options)', description: '更新剪贴板配置' },
              { method: 'clipboard.getOptions()', description: '获取当前配置' },
            ]}
            pagination={false}
          />
        </div>
        <div id="clipboard-usage-tips">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>复制节点：</strong>选中节点后按 Ctrl+C（Mac: ⌘+C）复制</li>
            <li><strong>粘贴节点：</strong>按 Ctrl+V（Mac: ⌘+V）粘贴，新节点会有偏移</li>
            <li><strong>剪切节点：</strong>按 Ctrl+X（Mac: ⌘+X）剪切，原节点会被删除</li>
            <li><strong>删除节点：</strong>按 Delete 或 Backspace 删除选中节点</li>
            <li><strong>偏移量：</strong>pasteOffset 控制粘贴时新节点的偏移距离</li>
            <li><strong>回调函数：</strong>可通过回调函数监控和控制复制粘贴行为</li>
            <li><strong>自定义 ID：</strong>可通过 generateId 函数自定义新节点的 ID 生成规则</li>
            <li><strong>边的复制：</strong>复制节点时，两端节点都被选中的边也会被复制</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '600px' }}>
        <PanelHeader title="Clipboard 剪贴板插件示例" />
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
          <Anchor.Link href="#clipboard-example-title" title="Clipboard 剪贴板示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#clipboard-config-section" title="配置选项" />
          <Anchor.Link href="#clipboard-shortcut-section" title="快捷键" />
          <Anchor.Link href="#clipboard-api-section" title="API 方法" />
          <Anchor.Link href="#clipboard-usage-tips" title="使用提示" />
        </Anchor>
      </div>
    </div>
  );
};

export default ClipboardExample;
