import { TreeNode } from './types';

export const fileTree: TreeNode = {
  id: 'root',
  name: 'Projects',
  type: 'folder',
  size: '—',
  modified: '2024-01-15',
  children: [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      size: '—',
      modified: '2024-01-14',
      children: [
        {
          id: 'components',
          name: 'components',
          type: 'folder',
          size: '—',
          modified: '2024-01-13',
          children: [
            {
              id: 'button-tsx',
              name: 'Button.tsx',
              type: 'file',
              size: '2.4 KB',
              modified: '2024-01-12',
            },
            {
              id: 'input-tsx',
              name: 'Input.tsx',
              type: 'file',
              size: '1.8 KB',
              modified: '2024-01-11',
            },
          ],
        },
        {
          id: 'app-tsx',
          name: 'App.tsx',
          type: 'file',
          size: '5.2 KB',
          modified: '2024-01-14',
        },
        {
          id: 'main-tsx',
          name: 'main.tsx',
          type: 'file',
          size: '0.8 KB',
          modified: '2024-01-10',
        },
      ],
    },
    {
      id: 'public',
      name: 'public',
      type: 'folder',
      size: '—',
      modified: '2024-01-08',
      children: [
        {
          id: 'favicon-ico',
          name: 'favicon.ico',
          type: 'file',
          size: '15.2 KB',
          modified: '2024-01-08',
        },
      ],
    },
    {
      id: 'package-json',
      name: 'package.json',
      type: 'file',
      size: '1.2 KB',
      modified: '2024-01-15',
    },
    {
      id: 'tsconfig-json',
      name: 'tsconfig.json',
      type: 'file',
      size: '0.6 KB',
      modified: '2024-01-09',
    },
    {
      id: 'readme-md',
      name: 'README.md',
      type: 'file',
      size: '3.1 KB',
      modified: '2024-01-15',
    },
  ],
};
