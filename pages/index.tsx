import { SimpleGrid } from '@mantine/core';
import { ResultsCard } from '../components/ResultsCard/ResultsCard';
import { Welcome } from '../components/Welcome/Welcome';

export default function HomePage() {
  return (
    <>
      <Welcome />
      <SimpleGrid
        mt={60}
        cols={4}
        spacing={20}
        mx={20}
        breakpoints={[
          {maxWidth:980, cols:3, spacing:'xl'},
          {maxWidth:760, cols:2, spacing:'xl'},
          {maxWidth:520, cols:1, spacing:'xl'},
        ]}>
        <ResultsCard/>
        <ResultsCard/>
        <ResultsCard/>
        <ResultsCard/>
      </SimpleGrid>
    </>
  );
}
