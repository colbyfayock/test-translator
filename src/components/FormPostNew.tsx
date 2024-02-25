import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { Editor as TipTapEditor } from '@tiptap/core';
import { ID } from 'appwrite';
import { Editor } from "novel";

import { databases } from '@/lib/appwrite';

const FormPostNew = () => {
  const [content, setContent] = useState<string>();

  function handleOnUpdate(editor: TipTapEditor) {
    setContent(editor.getHTML());
  }
  
  async function handleOnSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const target = event.target as typeof event.target & {
      title: { value: string };
      slug: { value: string };
      excerpt: { value: string };
    }

    const results = await databases.createDocument(
      import.meta.env.PUBLIC_APPWRITE_DATABASE_ID,
      import.meta.env.PUBLIC_APPWRITE_COLLECTION_ID,
      ID.unique(),
      {
        title: target.title.value,
        slug: target.slug.value,
        excerpt: target.excerpt.value,
        content
      }
    );

    window.location.href = `/posts/${results.slug}`;
  }

  return (
    <form onSubmit={handleOnSubmit}>
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3" htmlFor="title">Title</label>
        <input
          id="title"
          className="block w-full text-slate-900 border-slate-400 rounded focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          type="text"
          name="title"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3" htmlFor="slug">Slug</label>
        <input
          id="slug"
          className="block w-full text-slate-900 border-slate-400 rounded focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          type="text"
          name="slug"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">Content</label>
        <Editor
          defaultValue={{
            type: "doc",
            content: []
          }}
          disableLocalStorage={true}
          onDebouncedUpdate={handleOnUpdate}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3" htmlFor="excerpt">Excerpt</label>
        <input
          id="excerpt"
          className="block w-full text-slate-900 border-slate-400 rounded focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          type="text"
          name="excerpt"
        />
      </div>
      <button className="inline-block rounded py-2.5 px-6 text-sm font-bold uppercase text-white bg-slate-600 hover:bg-slate-500 dark:bg-slate-500 dark:hover:bg-slate-400">Submit</button>
    </form>
  )
}

export default FormPostNew;