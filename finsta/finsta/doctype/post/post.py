# Copyright (c) 2024, Rehan Ansari and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import pretty_date
from frappe.utils import strip_html

import random


class Post(Document):
	pass


@frappe.whitelist(allow_guest=True)
def get_posts_with_likes_and_comments(user=None):
    filters = {'owner': user} if user else {}
    posts = frappe.get_all('Post',
        filters=filters,
        fields=['name as id', 'text', 'file', 'owner','creation as created_at'],
        order_by='creation desc')

    for post in posts:
        post['created_at'] = pretty_date(post['created_at'])
        
        # Separate likes and comments
        post_comments = frappe.get_all('Comment', 
            filters={'reference_name': post['id'], 'reference_doctype': 'Post'},
            fields=['name as id', 'content', 'owner', 'creation', 'comment_type', 'reference_name'])

        # Add user details to each comment as a nested 'user' dictionary
        for comment in post_comments:
            comment['creation'] = pretty_date(comment['creation'])
            comment['content'] = strip_html(comment['content'])  # Escape HTML in content field
            user_details = frappe.get_value('User', comment['owner'], ['name as id', 'username', 'user_image'], as_dict=True)
            comment['user'] = user_details  # Assign user details to a nested 'user' key
        
        # Use list comprehensions to filter comments and likes based on comment_type
        post['comments'] = [c for c in post_comments if c['comment_type'] == 'Comment']
        post['likes'] = [c for c in post_comments if c['comment_type'] == 'Like']
        post['user'] = frappe.get_value('User', post['owner'], ['name as id', 'username', 'user_image'], as_dict=True)

    return posts

@frappe.whitelist(allow_guest=True)
def get_random_user():
    users = frappe.get_all(
        'User',
        filters=[['name', 'not in', ['Guest', 'Administrator']]],
        fields=['name as id', 'username', 'full_name', 'user_image']
    )
    random.shuffle(users)
    return users[:5]
