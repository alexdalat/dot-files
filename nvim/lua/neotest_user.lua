
require("neotest").setup({
  adapters = {
    require("neotest-gtest").setup({}),
    require("neotest-python")({
      runner = "pytest",

      -- Custom python path for the runner.
      -- Can be a string or a list of strings.
      -- Can also be a function to return dynamic value.
      -- If not provided, the path will be inferred by checking for 
      -- virtual envs in the local directory and for Pipenev/Poetry configs
      --python = ".venv/bin/python",

      -- Returns if a given file path is a test file.
      -- NB: This function is called a lot so don't perform any heavy tasks within it.
      -- see: https://github.com/nvim-neotest/neotest-python/blob/master/lua/neotest-python/base.lua for default
      --is_test_file = function(file_path)
      --  ...
      --end,
    }),
  },
  consumers = {
    overseer = require("neotest.consumers.overseer"),
  },
})
