import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const readingTime = post.data.content.reduce((acc, current) => {
    const wordsBody = RichText.asText(current.body).split(/\s+/g);
    const wordsHeading = current.heading.split(/\s+/g);

    const wordsTotal = wordsBody.length + wordsHeading.length;

    return Math.ceil(acc + wordsTotal / 200);
  }, 0);

  const { isFallback } = useRouter();

  if (isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <main>
        <img
          className={styles.postBanner}
          src={post.data.banner.url}
          alt={post.data.title}
        />

        <article className={styles.postContainer}>
          <header className={styles.postHeader}>
            <h1>{post.data.title}</h1>
            <ul>
              <li>
                <FiCalendar size={20} color="#BBBBBB" />
                <span>
                  {format(parseISO(post.first_publication_date), 'd MMM yyyy', {
                    locale: ptBR,
                  })}
                </span>
              </li>
              <li>
                <FiUser size={20} color="#BBBBBB" />
                <span>{post.data.author}</span>
              </li>

              <li>
                <FiClock size={20} color="#BBBBBB" />
                <span>{readingTime} min</span>
              </li>
            </ul>
          </header>

          {post.data.content.map((content, contentIndex) => (
            <section key={String(contentIndex)} className={styles.postContent}>
              <h2 key={String(contentIndex)}>{content.heading}</h2>
              {content.body.map((body, bodyIndex) => (
                <p key={String(bodyIndex)}>{body.text}</p>
              ))}
            </section>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {}
  );

  const paths = postsResponse.results.map(result => ({
    params: {
      slug: result.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  // console.log(JSON.stringify(response.data));

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: response.data.banner,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 1,
  };
};
