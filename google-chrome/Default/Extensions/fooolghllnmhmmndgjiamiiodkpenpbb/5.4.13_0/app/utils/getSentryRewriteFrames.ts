import { RewriteFrames } from '@sentry/integrations';

export const getSentryRewriteFrames = () => new RewriteFrames({
  iteratee: frame => {
    const rewrittenFrame = { ...frame };
    const distStr = '/dist/extension/';
    const distIdx = rewrittenFrame.filename.indexOf(distStr);

    if (distIdx > -1) {
      rewrittenFrame.filename = `@extension/${rewrittenFrame.filename.slice(distIdx + distStr.length)}`;
    }

    return rewrittenFrame;
  },
});
