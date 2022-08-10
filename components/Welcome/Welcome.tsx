import { Title, Text, Anchor } from '@mantine/core';
import useStyles from './Welcome.styles';

export function Welcome() {
  const { classes } = useStyles();

  return (
    <>
      <Title className={classes.title} align="center" mt={100}>
        Wyniki zawodów{' '}
        <Text inherit variant="gradient" component="span">
          Castingsport
        </Text>
      </Title>
      
    </>
  );
}
