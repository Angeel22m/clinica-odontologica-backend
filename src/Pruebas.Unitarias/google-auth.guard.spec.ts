import { GoogleAuthGuard } from '../auth/guards/google-auth/google-auth.guard';

describe('GoogleAuthGuard', () => {
  it('should be defined', () => {
    expect(new GoogleAuthGuard()).toBeDefined();
  });
});
