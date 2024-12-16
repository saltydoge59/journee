'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar';
import Underline from "@tiptap/extension-underline"
import HardBreak from '@tiptap/extension-hard-break';
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'


const Tiptap = ({onChange,content}:any) => {

  const handleChange = (newContent:string)=>{
    onChange(newContent);
  };
  

  const editor = useEditor({
    autofocus:true,
    editable:true,
    extensions: [StarterKit, Underline, Color, TextStyle,
      HardBreak.extend({
      addKeyboardShortcuts(){
        return {
          Enter:()=> this.editor.commands.setHardBreak()
        }
      }
      }),
    Link.configure(
      {
        openOnClick: false,
        autolink: true,
        linkOnPaste:true,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        HTMLAttributes:{
          class:'text-blue-400 underline'
        },
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false
            }

            // disallowed protocols
            const disallowedProtocols = ['ftp', 'file', 'mailto']
            const protocol = parsedUrl.protocol.replace(':', '')

            if (disallowedProtocols.includes(protocol)) {
              return false
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

            if (!allowedProtocols.includes(protocol)) {
              return false
            }

            // disallowed domains
            const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
            const domain = parsedUrl.hostname

            if (disallowedDomains.includes(domain)) {
              return false
            }

            // all checks have passed
            return true
          } catch (error) {
            return false
          }
        },
        shouldAutoLink: url => {
          try {
            // construct URL
            const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)

            // only auto-link if the domain is not in the disallowed list
            const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
            const domain = parsedUrl.hostname

            return !disallowedDomains.includes(domain)
          } catch (error) {
            return false
          }
        },

      
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
