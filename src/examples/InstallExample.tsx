import React, { useState } from 'react';
import { Tag, Space, Button, message } from '@zjpcy/simple-design';
import {
  Panel,
  PanelHeader,
  PanelContent,
} from './components/CodeEditor';
import './styles/panel.css';

/**
 * 安装指南示例
 *
 * 介绍如何在项目中安装、引入和使用 @zjpcy/workflow。
 */

const INSTALL_CODE = `# 使用 npm 安装
npm install @zjpcy/workflow react react-dom

# 或使用 yarn
yarn add @zjpcy/workflow react react-dom

# 或使用 pnpm
pnpm add @zjpcy/workflow react react-dom`;

const STYLE_CODE = `// 在你的应用入口文件中引入组件样式
import '@zjpcy/workflow/dist/esm/index.css';`;

const USAGE_CODE = `import React, { useEffect, useRef } from 'react';
import { Graph } from '@zjpcy/workflow';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      width: 800,
      height: 600,
      draggable: true,
      scalable: true,
      grid: {
        enabled: true,
        size: 20,
        color: '#e5e7eb',
      },
    });

    graph.addNode({
      id: 'start',
      label: '开始',
      x: 150,
      y: 150,
    });

    return () => {
      graph.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100vh' }}
    />
  );
}`;

const CLONE_CODE = `# 克隆 dev 分支源码
git clone -b dev https://github.com/chongyin10/workflow.git

# 进入项目目录并安装依赖
cd workflow
npm install`;

const DEV_CODE = `# 安装依赖后启动示例项目
npm run dev:examples

# 访问 http://localhost:3000 查看示例`;

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'bash' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      message.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error('复制失败');
    }
  };

  return (
    <div
      style={{
        marginTop: 12,
        marginBottom: 12,
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          fontSize: 12,
          color: '#64748b',
        }}
      >
        <span>{language}</span>
        <Button size="small" variant="secondary" onClick={handleCopy}>
          {copied ? '已复制' : '复制'}
        </Button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 16,
          overflow: 'auto',
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          color: '#1e293b',
          background: '#ffffff',
          whiteSpace: 'pre',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

interface StepProps {
  index: number;
  title: string;
  children: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ index, title, children }) => (
  <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
    <div
      style={{
        flexShrink: 0,
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: '#3b82f6',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {index}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: 15,
          color: '#1e293b',
        }}
      >
        {title}
      </h3>
      <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  </div>
);

const InstallExample: React.FC = () => {
  return (
    <Panel>
      <PanelHeader icon="📦" title="安装指南" hint="5 分钟快速上手 @zjpcy/workflow" />
      <PanelContent>
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                margin: '0 0 12px',
                fontSize: 18,
                color: '#1e293b',
              }}
            >
              快速开始
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: '#475569',
                lineHeight: 1.6,
              }}
            >
              <strong>@zjpcy/workflow</strong> 是一个基于 React + TypeScript 的可交互流程图画布组件库。
              按照下面的步骤操作，即可在项目中快速集成。
            </p>

            <Space gap={8} style={{ marginTop: 16 }} wrap="wrap">
              <Tag color="blue">React ≥ 16.8</Tag>
              <Tag color="blue">TypeScript 支持</Tag>
              <Tag color="blue">现代浏览器</Tag>
            </Space>
          </div>

          <Step index={1} title="安装依赖">
            <p style={{ margin: '0 0 8px' }}>
              <strong>@zjpcy/workflow</strong> 需要 React 作为 peer dependency，请确保同时安装
              <code>react</code> 和 <code>react-dom</code>。
            </p>
            <CodeBlock code={INSTALL_CODE} language="bash" />
          </Step>

          <Step index={2} title="引入样式">
            <p style={{ margin: '0 0 8px' }}>
              在应用入口文件中引入组件库样式，确保画布、节点、边等 UI 正常显示。
            </p>
            <CodeBlock code={STYLE_CODE} language="tsx" />
          </Step>

          <Step index={3} title="创建画布">
            <p style={{ margin: '0 0 8px' }}>
              使用 <code>Graph</code> 类创建画布，并添加节点即可开始使用。
            </p>
            <CodeBlock code={USAGE_CODE} language="tsx" />
          </Step>

          <Step index={4} title="克隆源码（可选）">
            <p style={{ margin: '0 0 8px' }}>
              如果想查看完整示例或进行二次开发，可以从 GitHub 克隆 dev 分支源码：
            </p>
            <CodeBlock code={CLONE_CODE} language="bash" />
            <p style={{ margin: '8px 0 0' }}>
              <a
                href="https://github.com/chongyin10/workflow/tree/dev"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                🔗 在 GitHub 上查看源码
              </a>
            </p>
          </Step>

          <Step index={5} title="运行项目">
            <p style={{ margin: '0 0 8px' }}>
              启动开发服务器后，即可在浏览器中查看效果：
            </p>
            <CodeBlock code={DEV_CODE} language="bash" />
          </Step>

          <div
            style={{
              marginTop: 8,
              padding: 16,
              background: '#eff6ff',
              borderRadius: 8,
              border: '1px solid #bfdbfe',
            }}
          >
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: 14,
                color: '#1d4ed8',
              }}
            >
              💡 提示
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: '#1e40af',
                lineHeight: 1.6,
              }}
            >
              左侧导航列出了所有核心组件的使用示例，点击任意菜单即可查看对应的交互演示和 API 说明。
              更多细节请查看项目根目录下的 <code>README.md</code> 和 <code>API_REFERENCE.md</code>。
            </p>
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
};

export default InstallExample;
export { InstallExample };
