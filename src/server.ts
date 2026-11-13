import { app } from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`Saahvik HOME running on port ${env.PORT}`);
});
