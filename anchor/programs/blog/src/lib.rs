use anchor_lang::prelude::*;

declare_id!("FLbwydxCq8AT5PbhiqZpvgTAXv4VnfvbYjMR7cg5WSLA");

#[program]
pub mod blog {
    use super::*;

    pub fn create_blog(ctx: Context<CreateBlog>, title: String, description: String) -> Result<()> {
        msg!("Creating a blog!!!");
        msg!("Title: {}", title);
        msg!("Description: {}", description);

        let blog_entry = &mut ctx.accounts.blog_entry;
        blog_entry.owner = ctx.accounts.owner.key();
        blog_entry.title = title;
        blog_entry.description = description;
        Ok(())
    }

    pub fn update_blog(
        ctx: Context<UpdateBlog>,
        new_description: String,
    ) -> Result<()> {
        msg!("Blog Entry Updated");
        msg!("New Description: {}", new_description);
    
        let blog_entry = &mut ctx.accounts.blog_entry;
        blog_entry.description = new_description;
    
        Ok(())
    }

    pub fn delete_blog(ctx: Context<DeleteBlog>, title: String) -> Result<()> {
        msg!("Delete Title: {}", title);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct CreateBlog<'info> {
    #[account(
        init,
        payer = owner,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        space = 8 + 32 + 4 + title.len() + 4 + description.len()
    )]
    pub blog_entry: Account<'info, BlogEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct UpdateBlog<'info> {
    #[account(
        mut,
        seeds = [blog_entry.title.as_bytes(), owner.key().as_ref()], 
        bump,
        realloc = 8 + 32 + 4 + blog_entry.title.len() + 4 + blog_entry.description.len(), // Use journal_entry.message instead of message
        realloc::payer = owner,
        realloc::zero = false, // Keep existing data instead of clearing it
    )]
    pub blog_entry: Account<'info, BlogEntryState>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>, // Correct system program reference
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteBlog<'info> {
    #[account( 
        mut, 
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        close = owner,
    )]
    pub blog_entry: Account<'info, BlogEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct BlogEntryState {
    pub owner: Pubkey,
    pub title: String,
    pub description: String
}