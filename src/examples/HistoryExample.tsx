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

// History 配置表格
const historyConfigColumns = [
  { title: '属性名', dataIndex: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', width: 120 },
  { title: '说明', dataIndex: 'description' },
];

const historyConfigData = [
  { name: 'enabled', type: 'boolean', default: 'true', description: '是否启用历史记录' },
  { name: 'maxStackSize', type: 'number', default: '50', description: '最大历史记录数量' },
  { name: 'keyboardShortcuts', type: 'boolean', default: 'true', description: '是否启用键盘快捷键' },
  { name: 'ignorePropertyChanges', type: 'boolean', default: 'false', description: '是否忽略属性变化' },
  { name: 'onChange', type: '(canUndo, canRedo) => void', default: '-', description: '历史记录变化回调' },
  { name: 'onBeforeUndo', type: '() => boolean | void', default: '-', description: '撤销前回调' },
  { name: 'onUndo', type: '() => void', default: '-', description: '撤销后回调' },
  { name: 'onBeforeRedo', type: '() => boolean | void', default: '-', description: '重做前回调' },
  { name: 'onRedo', type: '() => void', default: '-', description: '重做后回调' },
];

// 示例 1: 基础撤销重做
const EXAMPLE_1_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建历史记录插件
const history = new History({
  enabled: true,
  maxStackSize: 50,
  keyboardShortcuts: true,
});

// 安装插件
graph.use(history);

// 保存 history 实例到 window，供按钮使用
window.exampleHistory = history;

// 创建一些节点
const colors = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
];

for (let i = 0; i < 3; i++) {
  graph.addNode({
    id: 'node-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: 120 + i * 200,
    y: 150,
    style: {
      width: 100,
      height: 60,
      backgroundColor: colors[i].bg,
      borderColor: colors[i].border,
      textColor: colors[i].text,
      borderRadius: 8,
      borderWidth: 2,
    },
  });
}

console.log('✅ 基础撤销重做示例');
console.log('   - 添加节点、移动节点，然后点击"撤销"按钮或使用 Ctrl+Z');
console.log('   - 点击"重做"按钮或使用 Ctrl+Y 恢复');
console.log('');
console.log('   可用命令:');
console.log('   - history.undo()     撤销上一步操作');
console.log('   - history.redo()     重做上一步操作');
console.log('   - history.canUndo()  检查是否可以撤销');
console.log('   - history.canRedo()  检查是否可以重做');
console.log('   - history.clear()    清空历史记录');`;

// 示例 2: 批量操作
const EXAMPLE_2_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建历史记录插件
const history = new History({
  enabled: true,
  maxStackSize: 50,
  keyboardShortcuts: true,
});

graph.use(history);

// 保存 history 实例到 window
window.exampleHistory = history;

// 批量添加多个节点和边
// 整个批量操作只产生一条历史记录
history.batch(() => {
  // 添加第一个节点
  graph.addNode({
    id: 'batch-node-1',
    label: '开始',
    x: 100,
    y: 180,
    style: {
      width: 100,
      height: 60,
      backgroundColor: '#dbeafe',
      borderColor: '#3b82f6',
      textColor: '#1e40af',
      borderRadius: 8,
      borderWidth: 2,
    },
  });

  // 添加第二个节点
  graph.addNode({
    id: 'batch-node-2',
    label: '处理',
    x: 300,
    y: 180,
    style: {
      width: 100,
      height: 60,
      backgroundColor: '#dcfce7',
      borderColor: '#22c55e',
      textColor: '#166534',
      borderRadius: 8,
      borderWidth: 2,
    },
  });

  // 添加第三个节点
  graph.addNode({
    id: 'batch-node-3',
    label: '结束',
    x: 500,
    y: 180,
    style: {
      width: 100,
      height: 60,
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b',
      textColor: '#92400e',
      borderRadius: 8,
      borderWidth: 2,
    },
  });

  // 添加边
  graph.addEdge({
    source: 'batch-node-1',
    target: 'batch-node-2',
    style: { stroke: '#94a3b8', strokeWidth: 2 },
  });

  graph.addEdge({
    source: 'batch-node-2',
    target: 'batch-node-3',
    style: { stroke: '#94a3b8', strokeWidth: 2 },
  });
}, '创建流程图');

console.log('📦 批量操作示例');
console.log('   使用 history.batch() 方法可以将多个操作合并为一条历史记录');
console.log('   这样撤销时会一次性撤销整个批次，而不是逐个撤销');
console.log('');
console.log('   注意观察：');
console.log('   - 批量添加的 3 个节点和 2 条边只占用 1 条历史记录');
console.log('   - 撤销时会一次性删除所有节点和边');
console.log('   - 重做时会一次性恢复所有节点和边');`;

// 示例 3: 事件回调
const EXAMPLE_3_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建历史记录插件（带事件回调）
const history = new History({
  enabled: true,
  maxStackSize: 50,
  keyboardShortcuts: true,
  onChange: (canUndo, canRedo) => {
    console.log('历史记录状态变化:');
    console.log('   可撤销:', canUndo);
    console.log('   可重做:', canRedo);
  },
  onBeforeUndo: () => {
    console.log('⏪ 正在撤销...');
    return true; // 返回 false 可以阻止撤销
  },
  onUndo: () => {
    console.log('✅ 撤销完成');
  },
  onBeforeRedo: () => {
    console.log('⏩ 正在重做...');
    return true; // 返回 false 可以阻止重做
  },
  onRedo: () => {
    console.log('✅ 重做完成');
  },
});

graph.use(history);

// 保存 history 实例到 window
window.exampleHistory = history;

// 创建演示节点
graph.addNode({
  id: 'callback-node',
  label: '拖动我',
  x: 300,
  y: 170,
  style: {
    width: 140,
    height: 80,
    backgroundColor: '#f3e8ff',
    borderColor: '#8b5cf6',
    textColor: '#6b21a8',
    borderRadius: 12,
    borderWidth: 2,
  },
});

console.log('📣 事件回调示例');
console.log('   操作节点，观察控制台输出的事件日志');
console.log('');
console.log('   支持的回调:');
console.log('   - onChange        历史记录状态变化时触发');
console.log('   - onBeforeUndo    撤销前触发，返回 false 可阻止撤销');
console.log('   - onUndo          撤销完成后触发');
console.log('   - onBeforeRedo    重做前触发，返回 false 可阻止重做');
console.log('   - onRedo          重做完成后触发');`;

// 示例 4: 最大历史记录限制
const EXAMPLE_4_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建历史记录插件（限制为 3 条记录）
const history = new History({
  enabled: true,
  maxStackSize: 3,  // 只保留最近的 3 条记录
  keyboardShortcuts: true,
});

graph.use(history);

// 保存 history 实例到 window
window.exampleHistory = history;

// 添加 5 个节点（但历史记录只保留 3 个）
const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

for (let i = 0; i < 5; i++) {
  graph.addNode({
    id: 'limit-node-' + (i + 1),
    label: '节点 ' + (i + 1),
    x: 80 + i * 130,
    y: 170,
    style: {
      width: 100,
      height: 60,
      backgroundColor: colors[i],
      borderColor: colors[i],
      textColor: '#ffffff',
      borderRadius: 8,
      borderWidth: 2,
    },
  });
}

console.log('📊 历史记录限制示例');
console.log('   设置了 maxStackSize: 3（只保留最近 3 条记录）');
console.log('');
console.log('   当前状态:');
console.log('   - 添加了 5 个节点');
console.log('   - 但历史记录只保留 3 条（节点 3、4、5）');
console.log('   - 节点 1 和 2 的操作已经超出限制，无法撤销');
console.log('');
console.log('   检查: history.getUndoStackSize() 应该返回 3');`;

// 示例 5: 禁用键盘快捷键
const EXAMPLE_5_CODE = `// 创建 Graph 画布
const graph = new Graph({
  container: container,
  width: 700,
  height: 400,
  draggable: true,
  scalable: true,
  backgroundColor: '#f8fafc',
});

// 创建历史记录插件（禁用键盘快捷键）
const history = new History({
  enabled: true,
  maxStackSize: 50,
  keyboardShortcuts: false,  // 禁用键盘快捷键
});

graph.use(history);

// 保存 history 实例到 window
window.exampleHistory = history;

// 创建演示节点
graph.addNode({
  id: 'no-keyboard-node',
  label: '无键盘快捷键',
  x: 300,
  y: 170,
  style: {
    width: 160,
    height: 80,
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
    textColor: '#be185d',
    borderRadius: 12,
    borderWidth: 2,
  },
});

console.log('⌨️ 禁用键盘快捷键示例');
console.log('   设置了 keyboardShortcuts: false');
console.log('');
console.log('   效果:');
console.log('   - Ctrl+Z / Cmd+Z 不会触发撤销');
console.log('   - Ctrl+Y / Cmd+Shift+Z 不会触发重做');
console.log('   - 只能通过下方的按钮调用 history.undo() 和 history.redo()');
console.log('');
console.log('   适用场景:');
console.log('   - 需要自定义快捷键行为');
console.log('   - 与其他组件快捷键冲突');
console.log('   - 需要完全程序化控制');`;

// 所有示例
const EXAMPLES = [
  { id: 'example-1', title: '基础撤销重做', code: EXAMPLE_1_CODE },
  { id: 'example-2', title: '批量操作', code: EXAMPLE_2_CODE },
  { id: 'example-3', title: '事件回调', code: EXAMPLE_3_CODE },
  { id: 'example-4', title: '历史记录限制', code: EXAMPLE_4_CODE },
  { id: 'example-5', title: '禁用键盘快捷键', code: EXAMPLE_5_CODE },
];

export const HistoryExample: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef(EXAMPLE_1_CODE);
  const [editorKey, setEditorKey] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  // 更新按钮状态的回调
  const updateButtonState = useCallback(() => {
    const history = (window as any).exampleHistory;
    if (history) {
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
      setUndoCount(history.getUndoStackSize());
      setRedoCount(history.getRedoStackSize());
    }
  }, []);

  const executeCode = useCallback(async (codeToExecute: string) => {
    if (!graphContainerRef.current) return;

    graphContainerRef.current.innerHTML = '';

    try {
      const { Graph } = await import('../core');
      const { History } = await import('../plugins');

      const sandbox = {
        container: graphContainerRef.current,
        console: window.console,
        Graph,
        History,
      };

      const executableCode = `'use strict';
        const { container, console, Graph, History } = sandbox;
        ${codeToExecute}
      `;

      const fn = new Function('sandbox', executableCode);
      fn(sandbox);

      // 延迟更新按钮状态
      setTimeout(updateButtonState, 100);
    } catch (error) {
      console.error('代码执行错误:', error);
    }
  }, [updateButtonState]);

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

  const handleUndo = useCallback(() => {
    const history = (window as any).exampleHistory;
    if (history) {
      history.undo();
      updateButtonState();
    }
  }, [updateButtonState]);

  const handleRedo = useCallback(() => {
    const history = (window as any).exampleHistory;
    if (history) {
      history.redo();
      updateButtonState();
    }
  }, [updateButtonState]);

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

  // 监听画布点击，更新按钮状态
  useEffect(() => {
    const interval = setInterval(updateButtonState, 500);
    return () => clearInterval(interval);
  }, [updateButtonState]);

  const LeftPanel = (
    <Panel>
      <PanelHeader 
        icon="⏪" 
        title="撤销重做演示" 
        hint="操作节点后点击撤销/重做按钮或使用快捷键" 
      />
      <div
        ref={graphContainerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          background: '#f8fafc',
        }}
      />
      {/* 撤销/重做工具栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <Button 
          onClick={handleUndo}
          disabled={!canUndo}
          style={{ opacity: canUndo ? 1 : 0.5 }}
        >
          ⏪ 撤销
        </Button>
        <Button 
          onClick={handleRedo}
          disabled={!canRedo}
          style={{ opacity: canRedo ? 1 : 0.5 }}
        >
          ⏩ 重做
        </Button>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>
          <span style={{ marginRight: '16px' }}>
            可撤销: <strong style={{ color: canUndo ? '#3b82f6' : '#94a3b8' }}>{undoCount}</strong>
          </span>
          <span>
            可重做: <strong style={{ color: canRedo ? '#3b82f6' : '#94a3b8' }}>{redoCount}</strong>
          </span>
        </div>
      </div>
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
        <div id="history-config-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            History 配置选项
          </h3>
          <Table columns={historyConfigColumns} dataSource={historyConfigData} pagination={false} />
        </div>
        <div id="history-api-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            API 方法
          </h3>
          <Table
            columns={[
              { title: '方法名', dataIndex: 'method', width: 250 },
              { title: '说明', dataIndex: 'description' },
            ]}
            dataSource={[
              { method: 'graph.use(history)', description: '安装历史记录插件到 Graph 实例' },
              { method: 'history.enable()', description: '启用历史记录功能' },
              { method: 'history.disable()', description: '禁用历史记录功能' },
              { method: 'history.isEnabled()', description: '获取历史记录是否启用' },
              { method: 'history.undo()', description: '撤销上一步操作' },
              { method: 'history.redo()', description: '重做上一步操作' },
              { method: 'history.canUndo()', description: '检查是否可以撤销' },
              { method: 'history.canRedo()', description: '检查是否可以重做' },
              { method: 'history.clear()', description: '清空所有历史记录' },
              { method: 'history.batch(fn, desc)', description: '批量操作，多个操作合并为一条记录' },
              { method: 'history.getUndoStackSize()', description: '获取撤销栈大小' },
              { method: 'history.getRedoStackSize()', description: '获取重做栈大小' },
              { method: 'history.setOptions(options)', description: '更新配置选项' },
              { method: 'history.getOptions()', description: '获取当前配置' },
            ]}
            pagination={false}
          />
        </div>
        <div id="history-keyboard-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>
            键盘快捷键
          </h3>
          <Table
            columns={[
              { title: '快捷键', dataIndex: 'shortcut', width: 200 },
              { title: '功能', dataIndex: 'description' },
            ]}
            dataSource={[
              { shortcut: 'Ctrl + Z / Cmd + Z', description: '撤销上一步操作' },
              { shortcut: 'Ctrl + Y / Cmd + Shift + Z', description: '重做上一步操作' },
            ]}
            pagination={false}
          />
        </div>
        <div id="history-usage-tips">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>使用提示</h3>
          <ul style={{ lineHeight: '1.8', color: '#475569' }}>
            <li><strong>自动记录：</strong>安装插件后，添加/删除节点和边、移动节点会自动记录到历史栈</li>
            <li><strong>批量操作：</strong>使用 batch() 方法可将多个操作合并为一条记录，统一撤销/重做</li>
            <li><strong>容量限制：</strong>通过 maxStackSize 控制历史记录数量，超过限制时会自动丢弃最旧的记录</li>
            <li><strong>事件监听：</strong>使用 onChange 等回调可以监听历史记录状态变化，用于更新 UI</li>
            <li><strong>键盘控制：</strong>默认启用 Ctrl+Z/Ctrl+Y 快捷键，可通过 keyboardShortcuts 选项禁用</li>
            <li><strong>防循环：</strong>插件内部会阻止在撤销/重做过程中再次记录历史，避免循环</li>
          </ul>
        </div>
      </div>
    </Panel>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '600px' }}>
        <PanelHeader title="History 撤销重做插件示例" />
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
          <Anchor.Link href="#history-example-title" title="History 撤销重做示例" />
          {EXAMPLES.map((ex, index) => (
            <Anchor.Link key={ex.id} href={`#${ex.id}`} title={`示例 ${index + 1}: ${ex.title}`} />
          ))}
          <Anchor.Link href="#history-config-section" title="配置选项" />
          <Anchor.Link href="#history-api-section" title="API 方法" />
          <Anchor.Link href="#history-keyboard-section" title="键盘快捷键" />
          <Anchor.Link href="#history-usage-tips" title="使用提示" />
        </Anchor>
      </div>
    </div>
  );
};

export default HistoryExample;
