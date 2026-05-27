import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

interface Props {
  value: string;
  onChange?: (v: string) => void;
  language?: "json" | "javascript" | "text";
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "json",
  readOnly = false,
  minHeight = "180px",
  maxHeight = "60vh",
}: Props) {
  const ext =
    language === "json" ? [json()] : language === "javascript" ? [javascript()] : [];
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={ext}
      theme={oneDark}
      readOnly={readOnly}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: !readOnly,
        highlightActiveLineGutter: !readOnly,
      }}
      style={{
        fontSize: 12.5,
        borderRadius: 8,
        overflow: "hidden",
        minHeight,
        maxHeight,
      }}
    />
  );
}