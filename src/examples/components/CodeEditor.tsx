import React, { CSSProperties, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';

/**
 * 代码编辑器组件属性
 */
export interface CodeEditorProps {
  /** 代码内容 */
  value: string;
  /** 代码变化回调 */
  onUpdate?: (code: string) => void;
  /** 语言类型 */
  language?: string;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
  /** 编辑器字体大小 */
  fontSize?: string;
  /** 编辑器行高 */
  lineHeight?: string;
  /** 编辑器背景色 */
  background?: string;
}

/**
 * 获取语言扩展
 */
const getLanguageExtension = (language: string) => {
  switch (language) {
    case 'javascript':
    case 'js':
      return javascript();
    case 'typescript':
    case 'ts':
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'json':
      return json();
    default:
      return javascript({ jsx: true, typescript: true });
  }
};

/**
 * 代码编辑器组件
 * 基于 CodeMirror 封装，提供统一的样式和配置
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onUpdate,
  language = 'tsx',
  readOnly = false,
  className = '',
  style,
  fontSize = '13px',
  lineHeight = '1.6',
  background = '#fff',
}) => {
  const extensions = useMemo(() => {
    return [getLanguageExtension(language)];
  }, [language]);

  return (
    <div
      className={`code-editor ${className}`}
      style={{
        height: '100%',
        background,
        ...style,
        ['--editor-font-size' as string]: fontSize,
        ['--editor-line-height' as string]: lineHeight,
        ['--editor-background' as string]: background,
      }}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme="light"
        extensions={extensions}
        readOnly={readOnly}
        onChange={(newValue) => onUpdate?.(newValue)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
        }}
      />
    </div>
  );
};

/**
 * 面板头部组件属性
 */
export interface PanelHeaderProps {
  /** 图标 */
  icon?: string;
  /** 标题 */
  title: string;
  /** 提示信息 */
  hint?: string;
}

/**
 * 面板头部组件
 */
export const PanelHeader: React.FC<PanelHeaderProps> = ({ icon, title, hint }) => (
  <div className="panel-header">
    {icon && <span className="panel-header-icon">{icon}</span>}
    <span className="panel-header-title">{title}</span>
    {hint && <span className="panel-header-hint">{hint}</span>}
  </div>
);

/**
 * 面板容器组件属性
 */
export interface PanelProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

/**
 * 面板容器组件
 */
export const Panel: React.FC<PanelProps> = ({ children, className = '' }) => (
  <div className={`panel-container ${className}`}>{children}</div>
);

/**
 * 面板内容区组件
 */
export const PanelContent: React.FC<PanelProps> = ({ children, className = '' }) => (
  <div className={`panel-content ${className}`}>{children}</div>
);

/**
 * 面板工具栏组件
 */
export const PanelToolbar: React.FC<PanelProps> = ({ children, className = '' }) => (
  <div className={`panel-toolbar ${className}`}>{children}</div>
);

/**
 * 按钮组件属性
 */
export interface ButtonProps {
  /** 按钮类型 */
  type?: 'default' | 'primary';
  /** 点击回调 */
  onClick?: () => void;
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

/**
 * 按钮组件
 */
export const Button: React.FC<ButtonProps> = ({
  type = 'default',
  onClick,
  children,
  className = '',
}) => (
  <button
    className={`btn btn-${type} ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default CodeEditor;
