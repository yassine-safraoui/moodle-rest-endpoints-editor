export async function generateMetadata({
    params,
  }: {
    params: { name: string };
  }) {
    return {
      title: `${params.name} - Category`,
    };
  }
  
  // eslint-disable-next-line import/no-anonymous-default-export
  export default ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
    return children;
  };
  