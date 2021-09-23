import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}
export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<PostPagination>(postsPagination);

  function handleLoadMore() {
    fetch(posts.next_page)
      .then(response => response.json())
      .then(data => {
        const results = data.results.map(post => ({
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        }));

        setPosts({
          results: [...posts.results, ...results],
          next_page: data.next_page,
        });
      });
  }

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>

                <div className={styles.postInfo}>
                  <span>
                    <FiCalendar size={20} color="#BBBBBB" />
                    {format(
                      parseISO(post.first_publication_date),
                      'd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </span>

                  <span>
                    <FiUser size={20} color="#BBBBBB" />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {posts.next_page && (
          <button
            type="button"
            className={styles.loadMore}
            onClick={handleLoadMore}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const postsPagination = {
    results,
    next_page: postsResponse.next_page,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
