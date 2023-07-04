let lastPage: string | null = null;

export const getLastPage = () => lastPage;

export const setLastPage = (page: string | null) => {
  lastPage = page;
};
