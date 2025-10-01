import { getBlogPosts, getRelatedPosts } from '../lib/blogUtils';
// We need to import the original db to mock it.
// We'll use a little trick to allow us to overwrite it.
import * as admin from '../lib/firebase-server';

function assert(condition: any, message: string) {
  if (!condition) {
    console.error('Assertion failed:', message);
    // Throw an error to make sure the script exits with a failure code
    throw new Error(message);
  }
}

// --- Mock Firestore Setup ---

// This will hold our mock data
let mockBlogData: any[] = [];

const mockDb = {
  collection: (name: string) => {
    assert(name === 'blogPosts', 'Test should query "blogPosts" collection');

    // Create a new query state for each call to collection()
    let queryState = {
      filters: [] as { field: string; op: string; value: any }[],
      sort: { field: '', dir: '' },
      lim: -1,
    };

    const query = {
      where: function(field: string, op: string, value: any) {
        queryState.filters.push({ field, op, value });
        return this;
      },

      orderBy: function(field: string, dir: string) {
        queryState.sort = { field, dir };
        return this;
      },

      limit: function(num: number) {
        queryState.lim = num;
        return this;
      },

      get: async function() {
        let results = [...mockBlogData];

        // Apply filters (simulating Firestore's query engine)
        results = results.filter(doc => {
          return queryState.filters.every(f => {
            if (f.op === '==') return doc[f.field] === f.value;
            if (f.op === 'array-contains-any') return f.value.some((v: any) => doc[f.field].includes(v));
            return true;
          });
        });

        // Apply sorting
        if (queryState.sort.field) {
          results.sort((a, b) => {
            const valA = a[queryState.sort.field];
            const valB = b[queryState.sort.field];
            if (valA < valB) return queryState.sort.dir === 'desc' ? 1 : -1;
            if (valA > valB) return queryState.sort.dir === 'desc' ? -1 : 1;
            return 0;
          });
        }

        // Apply limit
        if (queryState.lim > 0) {
          results = results.slice(0, queryState.lim);
        }

        return {
          forEach: (callback: (doc: any) => void) => {
            results.forEach(doc => callback({
              id: doc.id,
              data: () => doc
            }));
          }
        };
      }
    };
    return query;
  }
};


// --- Test Cases ---

async function testGetBlogPostsReturnsCorrectCount() {
  console.log('Running test: testGetBlogPostsReturnsCorrectCount...');

  // Arrange: Create mock data where the 5 most recent posts include 2 unpublished ones.
  mockBlogData = [
    { id: 'post1', title: 'Post 1', published: true, createdAt: new Date('2023-01-01') },
    { id: 'post2', title: 'Post 2', published: true, createdAt: new Date('2023-01-02') },
    { id: 'post3', title: 'Post 3', published: true, createdAt: new Date('2023-01-03') },
    { id: 'post4', title: 'Post 4 (Unpublished)', published: false, createdAt: new Date('2023-01-04') },
    { id: 'post5', title: 'Post 5', published: true, createdAt: new Date('2023-01-05') },
    { id: 'post6', title: 'Post 6 (Unpublished)', published: false, createdAt: new Date('2023-01-06') },
    { id: 'post7', title: 'Post 7', published: true, createdAt: new Date('2023-01-07') },
  ];

  // Act
  const posts = await getBlogPosts({ limit: 5, publishedOnly: true });

  // Assert: This will fail because the buggy function returns 3. The fixed function will return 5.
  assert(
    posts.length === 5,
    `getBlogPosts should return 5 published posts, but got ${posts.length}`
  );

  const allPublished = posts.every(p => p.published);
  assert(allPublished, 'All posts returned by getBlogPosts should be published');

  console.log('  -> Passed: testGetBlogPostsReturnsCorrectCount');
}

async function testGetRelatedPostsExcludesUnpublished() {
  console.log('Running test: testGetRelatedPostsExcludesUnpublished...');

  // Arrange: An unpublished post is one where `published` is missing or false.
  mockBlogData = [
    { id: 'current', title: 'Current Post', published: true, tags: ['tech'], createdAt: new Date('2023-01-05') },
    { id: 'related-pub', title: 'Related Published', published: true, tags: ['tech'], createdAt: new Date('2023-01-04') },
    // This post is unpublished because the `published` field is missing.
    { id: 'related-unpub-missing', title: 'Related Unpublished', tags: ['tech'], createdAt: new Date('2023-01-03') },
    { id: 'unrelated', title: 'Unrelated Post', published: true, tags: ['other'], createdAt: new Date('2023-01-02') },
  ];

  // Act
  const relatedPosts = await getRelatedPosts('current', { tags: ['tech'], limit: 5 });

  // Assert: The buggy function includes the post with the missing `published` field. It will return 2 posts.
  // The fixed function will only return the single published post.
  assert(
    relatedPosts.length === 1,
    `getRelatedPosts should return 1 published post, but got ${relatedPosts.length}`
  );

  const hasUnpublished = relatedPosts.some(p => !(p as any).published);
  assert(!hasUnpublished, 'getRelatedPosts should not return unpublished posts');

  console.log('  -> Passed: testGetRelatedPostsExcludesUnpublished');
}


async function main() {
  console.log('Running blog functionality tests...');

  // Monkey-patch the db object before running tests
  // @ts-ignore - We are intentionally overwriting the read-only export for testing
  admin.db = mockDb;

  try {
    await testGetBlogPostsReturnsCorrectCount();
    await testGetRelatedPostsExcludesUnpublished();
    console.log('OK: All blog functionality tests passed.');
  } catch (e: any) {
    console.error(`\nTest failed: ${e.message}`);
    process.exit(1);
  }
}

main();