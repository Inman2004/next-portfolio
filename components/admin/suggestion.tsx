import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { Suggestion } from '@tiptap/suggestion';
import { CommandList } from './CommandList';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
} from 'lucide-react';
import React from 'react';

export const suggestion = {
  items: ({ query }: { query: string }) => {
    return [
      { title: 'Heading 1', icon: <Heading1 size={16} />, command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run() } },
      { title: 'Heading 2', icon: <Heading2 size={16} />, command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run() } },
      { title: 'Heading 3', icon: <Heading3 size={16} />, command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run() } },
      { title: 'Bullet List', icon: <List size={16} />, command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).toggleBulletList().run() } },
      { title: 'Numbered List', icon: <ListOrdered size={16} />, command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).toggleOrderedList().run() } },
      { title: 'Quote', icon: <Quote size={16} />, command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).toggleBlockquote().run() } },
      { title: 'Code Block', icon: <Code size={16} />, command: ({ editor, range }: any) => { editor.chain().focus().deleteRange(range).toggleCodeBlock().run() } },
    ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
  },

  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};

export const SlashCommand = Suggestion(suggestion);