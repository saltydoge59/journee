"use client"

import React from 'react'
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
} from "lucide-react"

type Props = {
    editor: Editor | null;
    content: string;
}

const Toolbar = ({editor,content}:Props)=>{
    if(!editor){
        return null;
    }
    return(
        <div className='px-4 py-3 rounded-tl-md ronuded-tr-md flex justify-between items-start gap-5 w-full flex-wrap border border-slate-300'>
            <div className='flex justify-start items-center gap-5 w-full lg:w-10/12 flex-wrap'>
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
            </div>
        </div>
    )
}

export default Toolbar