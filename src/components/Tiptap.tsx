'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar';
import Underline from "@tiptap/extension-underline"
import HardBreak from '@tiptap/extension-hard-break';



const Tiptap = ({onChange,content}:any) => {

  const handleChange = (newContent:string)=>{
    onChange(newContent);
  };
  

  const editor = useEditor({
    autofocus:true,
    editable:true,
    extensions: [StarterKit, Underline, HardBreak.extend({
      addKeyboardShortcuts(){
        return {
          Enter:()=> this.editor.commands.setHardBreak()
        }
      }
    })],
    editorProps:{
      attributes:{
        class:"flex flex-col px-4 py-3 justify-start items-start w-full gap-3 text-[16px] pt-4 border p-2 rounded h-auto"
      }
    },
    onUpdate:({editor})=>{
      handleChange(editor.getHTML());
    },
    content,
    immediatelyRender:false,
  })

  return(
    <div className='w-full'>
      <Toolbar editor={editor} content={content}/>
      <EditorContent className='text-start' style={{whiteSpace:"pre-line"}} editor={editor}/>
    </div>
  )
}

export default Tiptap
