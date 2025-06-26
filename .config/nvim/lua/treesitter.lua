
---@diagnostic disable-next-line: missing-fields
require 'nvim-treesitter.configs'.setup {
    ensure_installed = { "cpp", "lua", "vim", "vimdoc", "python", "bash", "json", "yaml", "html", "css", "javascript" },
    sync_install = true,

    -- Recommendation: set to false if you don't have `tree-sitter` CLI installed locally
    auto_install = true,
    ignore_install = {},

    highlight = {
        enable = true,

        -- NOTE: these are the names of the parsers and not the filetype.
        disable = { "c", "rust" },
    },
}

-- for creating C++ implementations
require 'nt-cpp-tools'.setup({
    preview = {
        quit = 'q', -- optional keymapping for quit preview
        accept = '<CR>' -- optional keymapping for accept preview
    },
})
