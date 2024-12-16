"use client"

import React, { useCallback } from 'react'
import { type Editor } from "@tiptap/react";
import {
    Bold,
    Strikethrough,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Underline,
    Quote,
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
        <div className='px-4 py-3 rounded-tl-md ronuded-tr-md flex justify-between items-start gap-5 w-full flex-wrap border border-slate-300'>
            <div className='flex justify-start items-center gap-5 w-full lg:w-10/12 flex-wrap'>
            {/* Color */}
                <input
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
                    editor.isActive("bold")?"bg-indigo-500 text-white rounded-lg":"text-purple-500"
                }>
                    <Bold className='w-5 h-5'/>
                </button>
            {/* Italic */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleItalic().run();
                }}
                className={
                    editor.isActive("italic")?"bg-indigo-500 text-white rounded-lg":"text-purple-500"
                }>
                    <Italic className='w-5 h-5'/>
                </button>
            {/* Underline */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleUnderline().run();
                }}
                className={
                    editor.isActive("underline")?"bg-indigo-500 text-white rounded-lg":"text-purple-500"
                }>
                    <Underline className='w-5 h-5'/>
                </button>
            {/* Strikethrough */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleStrike().run();
                }}
                className={
                    editor.isActive("strike")?"bg-indigo-500 text-white rounded-lg":"text-purple-500"
                }>
                    <Strikethrough className='w-5 h-5'/>
                </button>
            {/* Undo */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().undo().run();
                }}
                className={
                    editor.isActive("undo")?"bg-indigo-500 text-white rounded-lg":"text-purple-500"
                }>
                    <Undo className='w-5 h-5'/>
                </button>
            {/* Redo */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().redo().run();
                }}
                className={
                    editor.isActive("redo")?"bg-indigo-500 text-white rounded-lg":"text-purple-500"
                }>
                    <Redo className='w-5 h-5'/>
                </button>

                <button onClick={setLink} className={editor.isActive('link') ? 'bg-indigo-500 text-white rounded-lg' : 'text-purple-500'}>
                    <Link className='w-5 h-5'/>
                </button>
                <button
                    className='text-purple-500'
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