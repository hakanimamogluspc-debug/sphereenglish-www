import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';

import { Users } from './src/payload/collections/Users';
import { Media } from './src/payload/collections/Media';
import { Solutions } from './src/payload/collections/Solutions';
import { BlogPosts } from './src/payload/collections/BlogPosts';
import { HomePage } from './src/payload/globals/HomePage';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Sphere English CMS',
    },
  },
  collections: [Users, Media, Solutions, BlogPosts],
  globals: [HomePage],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'CHANGE-THIS-IN-PRODUCTION-' + Math.random().toString(36),
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL,
    },
    schemaName: 'payload',
    push: true,
  }),
  sharp,
  upload: {
    limits: { fileSize: 10_000_000 }, // 10MB
  },
  cors: '*',
  csrf: [
    'https://www.sphereenglish.com',
    'https://sphereenglish.com',
  ],
});
