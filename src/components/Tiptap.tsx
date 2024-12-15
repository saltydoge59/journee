'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar';
import Underline from "@tiptap/extension-underline"

const Tiptap = ({onChange,content}:any) => {
  const handleChange = (newContent:string)=>{
    onChange(newContent);
  };
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    editorProps:{
      attributes:{
        class:"flex flex-col px-4 py-3 justify-start items-start w-full gap-3 text-[16px] pt-4  border p-2 rounded h-[30vh]"
      }
    },
    onUpdate:({editor})=>{
      handleChange(editor.getHTML());
    },
  })

  return(
    <div className='w-full'>
      <Toolbar editor={editor} content={content}/>
      <EditorContent style={{whiteSpace:"pre-line"}} editor={editor}/>
    </div>
  )
}

export default Tiptap
