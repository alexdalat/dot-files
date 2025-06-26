vim.o.foldlevel = 99 -- Using ufo provider need a large value, feel free to decrease the value
vim.o.foldenable = true

-- for arrows
vim.o.fillchars = [[eob: ,fold: ,foldopen:,foldsep: ,foldclose:]]
vim.o.foldcolumn = '1'


local wk = require('which-key')

wk.add({
  mode = { "n", "v" },
  { "z", group = "Folds" },
  { "zR", '<cmd>lua require("ufo").openAllFolds()<CR>', desc = "Open all folds" },
  { "zM", '<cmd>lua require("ufo").closeAllFolds()<CR>', desc = "Close all folds" },
})


local handler = function(virtText, lnum, endLnum, width, truncate)
    local newVirtText = {}
    local suffix = ('     ... %d lines '):format(endLnum - lnum)
    local sufWidth = vim.fn.strdisplaywidth(suffix)
    local targetWidth = width - sufWidth
    local curWidth = 0
    for _, chunk in ipairs(virtText) do
        local chunkText = chunk[1]
        local chunkWidth = vim.fn.strdisplaywidth(chunkText)
        if targetWidth > curWidth + chunkWidth then
            table.insert(newVirtText, chunk)
        else
            chunkText = truncate(chunkText, targetWidth - curWidth)
            local hlGroup = chunk[2]
            table.insert(newVirtText, { chunkText, hlGroup })
            chunkWidth = vim.fn.strdisplaywidth(chunkText)
            -- str width returned from truncate() may less than 2nd argument, need padding
            if curWidth + chunkWidth < targetWidth then
                suffix = suffix .. (' '):rep(targetWidth - curWidth - chunkWidth)
            end
            break
        end
        curWidth = curWidth + chunkWidth
    end
    table.insert(newVirtText, { suffix, 'MoreMsg' })
    return newVirtText
end

require('ufo').setup({
    fold_virt_text_handler = handler,
    close_fold_kinds = {}, -- default: 'imports', 'comment'
    open_fold_hl_timeout = 50,
    provider_selector = function(_, ft, _)
        local lspWithOutFolding = { "markdown", "sh", "css", "html", "python" }
        if vim.tbl_contains(lspWithOutFolding, ft) then
            return { "treesitter", "indent" }
        else
            return { "lsp", "indent" }
        end
    end,
})
