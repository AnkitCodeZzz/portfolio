"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { TextareaHTMLAttributes } from "react";

function resizeTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) {
    return;
  }

  textarea.style.height = "0px";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

type AutoResizeTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> & {
  className: string;
};

const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  function AutoResizeTextarea({ className, value, ...props }, forwardedRef) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(forwardedRef, () => textareaRef.current as HTMLTextAreaElement);

    useEffect(() => {
      resizeTextarea(textareaRef.current);
    }, [value]);

    return (
      <textarea
        {...props}
        ref={textareaRef}
        className={className}
        value={value}
      />
    );
  }
);

export default AutoResizeTextarea;
