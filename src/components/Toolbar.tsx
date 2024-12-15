"use client"

import React from 'react'
import { type Editor } from "@tiptap/react";
import {
    Bold,
    Strikethrough,
    Italic,
    List,
    ListOrdered,
    Heading2,
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
                    editor.isActive("bold")?"bg-sky-700 text-white p-2 rounded-lg":"text-sky-400"
                }>
                    <Bold className='w-5 h-5'/>
                </button>
            {/* Italic */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleItalic().run();
                }}
                className={
                    editor.isActive("italic")?"bg-sky-700 text-white p-2 rounded-lg":"text-sky-400"
                }>
                    <Italic className='w-5 h-5'/>
                </button>
            {/* Underline */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleUnderline().run();
                }}
                className={
                    editor.isActive("underline")?"bg-sky-700 text-white p-2 rounded-lg":"text-sky-400"
                }>
                    <Underline className='w-5 h-5'/>
                </button>
            {/* Strikethrough */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleStrike().run();
                }}
                className={
                    editor.isActive("strikethrough")?"bg-sky-700 text-white p-2 rounded-lg":"text-sky-400"
                }>
                    <Strikethrough className='w-5 h-5'/>
                </button>
            {/* List */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBulletList().run();
                }}
                className={
                    editor.isActive("bulletList")?"bg-sky-700 text-white p-2 rounded-lg":"text-sky-400"
                }>
                    <List className='w-5 h-5'/>
                </button>
            {/* Header */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleHeading({level:2}).run();
                }}
                className={
                    editor.isActive("heading")?"bg-sky-700 text-white p-2 rounded-lg":"text-sky-400"
                }>
                    <Heading2 className='w-5 h-5'/>
                </button>
            {/* Ordered List */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleOrderedList().run();
                }}
                className={
                    editor.isActive("orderedList")?"bg-sky-700 text-white p-2 rounded-lg":"text-sky-400"
                }>
                    <ListOrdered className='w-5 h-5'/>
                </button>
            {/* Blockquote */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBlockquote().run();
                }}
                className={
                    editor.isActive("blockquote")?"bg-sky-700 text-white p-2 rounded-lg":"text-sky-400"
                }>
                    <Quote className='w-5 h-5'/>
                </button>
            {/* Undo */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().undo().run();
                }}
                className={
                    editor.isActive("undo")?"bg-sky-700 text-white p-2 rounded-lg":"text-sky-400"
                }>
                    <Undo className='w-5 h-5'/>
                </button>
            {/* Redo */}
                <button onClick={(e) => {
                    e.preventDefault();
                    editor.chain().focus().redo().run();
                }}
                className={
                    editor.isActive("redo")?"bg-sky-700 text-white p-2 rounded-lg":"text-sky-400"
                }>
                    <Redo className='w-5 h-5'/>
                </button>
            </div>
        </div>
    )
}

export default Toolbar