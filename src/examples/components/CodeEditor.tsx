import React, { CSSProperties, Suspense, lazy } from 'react';
import { Button } from '@zjpcy/simple-design';

// 懒加载 CodeMirror 组件和语言包
const CodeMirror = lazy(() => import('@uiw/react-codemirror'));

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

// 缓存语言扩展模块
const languageExtensions: Record<string, Promise<any>> = {};

/**
 * 动态获取语言扩展
 */
const getLanguageExtension = async (language: string) => {
  const cacheKey = language;
  
  if (!languageExtensions[cacheKey]) {
    switch (language) {
      case 'javascript':
      case 'js':
        languageExtensions[cacheKey] = import('@codemirror/lang-javascript').then(mod => mod.javascript());
        break;
      case 'typescript':
      case 'ts':
      case 'tsx':
        languageExtensions[cacheKey] = import('@codemirror/lang-javascript').then(mod => mod.javascript({ jsx: true, typescript: true }));
        break;
      case 'json':
        languageExtensions[cacheKey] = import('@codemirror/lang-json').then(mod => mod.json());
        break;
      default:
        languageExtensions[cacheKey] = import('@codemirror/lang-javascript').then(mod => mod.javascript({ jsx: true, typescript: true }));
    }
  }
  
  return languageExtensions[cacheKey];
};

/**
 * 编辑器内部组件
 */
const EditorInner: React.FC<CodeEditorProps> = ({
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
  const [extensions, setExtensions] = React.useState<any[]>([]);

  React.useEffect(() => {
    getLanguageExtension(language).then(ext => {
      setExtensions([ext]);
    });
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
      <Suspense fallback={<div className="editor-loading">加载编辑器...</div>}>
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
      </Suspense>
    </div>
  );
};

/**
 * 代码编辑器组件
 * 基于 CodeMirror 封装，提供统一的样式和配置
 */
export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  return <EditorInner {...props} />;
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

export default CodeEditor;
