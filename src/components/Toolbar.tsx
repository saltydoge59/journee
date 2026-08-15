"use client"

import React, { useCallback } from 'react'
import { type Editor } from "@tiptap/react";
import {
    Bold,
    Strikethrough,
    Italic,
    Underline,
    Undo,
    Redo,
    Link,
    Unlink
} from "lucide-react"

type Props = {
    editor: Editor | null;
    content: string;
}

const Toolbar = ({editor,content}:Props)=>{
    if(!editor){
        return null;
    }
    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)
    
        // cancelled
        if (url === null) {
          return
        }
    
        // empty
        if (url === '') {
          editor.chain().focus().extendMarkRange('link').unsetLink()
            .run()
    
          return
        }
    
        // update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url })
          .run()
      }, [editor])
    
      if (!editor) {
        return null
      }
    
    return(
        <div className='px-4 py-3 rounded-t-sm flex justify-between items-start gap-5 w-full flex-wrap border border-border bg-secondary/40'>
            <div className='flex justify-start items-center gap-5 w-full lg:w-10/12 flex-wrap'>
            {/* Color */}
                <input
                className='border-border border h-6 w-6 rounded-sm bg-transparent'
                type="color"
                onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                value={editor.getAttributes('textStyle').color}
                data-testid="setColor"
                />
            {/* Bold */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBold().run();
                }}
                className={
                    editor.isActive("bold")?"bg-primary text-primary-foreground rounded-sm":"text-muted-foreground hover:text-foreground"
                }>
                    <Bold className='w-5 h-5'/>
                </button>
            {/* Italic */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleItalic().run();
                }}
                className={
                    editor.isActive("italic")?"bg-primary text-primary-foreground rounded-sm":"text-muted-foreground hover:text-foreground"
                }>
                    <Italic className='w-5 h-5'/>
                </button>
            {/* Underline */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleUnderline().run();
                }}
                className={
                    editor.isActive("underline")?"bg-primary text-primary-foreground rounded-sm":"text-muted-foreground hover:text-foreground"
                }>
                    <Underline className='w-5 h-5'/>
                </button>
            {/* Strikethrough */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleStrike().run();
                }}
                className={
                    editor.isActive("strike")?"bg-primary text-primary-foreground rounded-sm":"text-muted-foreground hover:text-foreground"
                }>
                    <Strikethrough className='w-5 h-5'/>
                </button>
            {/* Undo */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().undo().run();
                }}
                className={
                    editor.isActive("undo")?"bg-primary text-primary-foreground rounded-sm":"text-muted-foreground hover:text-foreground"
                }>
                    <Undo className='w-5 h-5'/>
                </button>
            {/* Redo */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().redo().run();
                }}
                className={
                    editor.isActive("redo")?"bg-primary text-primary-foreground rounded-sm":"text-muted-foreground hover:text-foreground"
                }>
                    <Redo className='w-5 h-5'/>
                </button>

                <button onClick={setLink} className={editor.isActive('link') ? 'bg-primary text-primary-foreground rounded-sm' : 'text-muted-foreground hover:text-foreground'}>
                    <Link className='w-5 h-5'/>
                </button>
                <button
                    className='text-muted-foreground hover:text-foreground disabled:opacity-30'
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    disabled={!editor.isActive('link')}
                >
                    <Unlink className='w-5 h-5'/>
                </button>
            </div>
        </div>
    )
}

export default Toolbar