<script setup>
  import { reactive, toRefs } from 'vue'
  import { Head, Link, router } from '@inertiajs/vue3'
  import MainLayout from '@/Layouts/MainLayout.vue';

  import ContentOverlay from '../Components/ContentOverlay.vue';
  import ShowPostOverlay from '../Components/ShowPostOverlay.vue';

  import Cog from 'vue-material-design-icons/Cog.vue'
  import Grid from 'vue-material-design-icons/Grid.vue'
  import PlayBoxOutline from 'vue-material-design-icons/PlayBoxOutline.vue'
  import BookmarkOutline from 'vue-material-design-icons/BookmarkOutline.vue';
  import AccountBoxOutline from 'vue-material-design-icons/AccountBoxOutline.vue';

    import { createResource, createListResource } from 'frappe-ui'

    import { session } from '../data/session'
    let data = reactive({ post: null})
    const form = reactive({ file: null})

    const props = defineProps({ postsByUser: Object, user: Object})
    const { postsByUser, user } = toRefs(props)


    const getUploadedImage = async (e) => {
        form.file = e.target.files[0];

        // Step 1: Upload the file to get a valid URL
        const formData = new FormData();
        formData.append("file", form.file);
        formData.append("file_name", form.file.name);

        try {
            // Upload file to obtain the file URL
            const uploadResponse = await fetch('http://127.0.0.1:8000/api/method/upload_file', {
                method: 'POST',
                headers: {
                    'Authorization': `token 73b6530029d4dea:eee2a9432d87585`,
                },
                body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (uploadResponse.ok) {
                console.log('File uploaded successfully', uploadData);

                // Step 2: Extract the file URL and update the user_image field
                const fileUrl = uploadData.message.file_url;
                const payload = { "user_image": fileUrl };

                const updateResponse = await fetch(`http://127.0.0.1:8000/api/resource/User/${session.user}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token 73b6530029d4dea:eee2a9432d87585`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const updateData = await updateResponse.json();

                if (updateResponse.ok) {
                    console.log('User image updated successfully', updateData);
                } else {
                    console.error('Error updating user image', updateData);
                }

            } else {
                console.error('Error uploading file', uploadData);
            }

        } catch (error) {
            console.error('Error during API call', error);
        }
    };    


const addComment = (object) => {
    let comment_doc = createListResource({
      doctype: 'Comment',
      fields: ['reference_doctype', 'reference_name', 'comment_type', 'content'],
      auto: true,
      
      insert: {
        onSuccess(data) {
            console.log("Post created successfully:", data)
          },
        onError(error) {
          console.error("Error creating post:", error)
        }
      }
    })

    // const updatedPost = (object) => {
    //   for (let i = 0; i < posts.data.length; i++) {
    //     const post = posts.data[i];
    //     if (post.id == object.post.id) {
    //       currentPost.value = post
    //     }
    //   }
    // }

    // Inserting a new post with the uploaded file's URL
    comment_doc.insert.submit({
      comment_type: 'Comment',
      reference_doctype: 'Post',
      reference_name: object.post.id,
      content: object.comment
    })
  }

  const deleteFunc = (object) => {

    let delete_post_doc = createListResource({
          doctype: 'Post',
          fields: ['file', 'text'],
          auto: true,
    })


    let delete_comment_doc = createListResource({
          doctype: 'Comment',
          fields: ['reference_doctype', 'reference_name', 'comment_type', 'content'],
          auto: true,
    })

    if (object.deleteType === 'Post') {
      delete_post_doc.delete.submit(object.id)
      setTimeout(() => data.post = null, 100)
      console.log('post deleted successfully')
    } else {
      delete_comment_doc.delete.submit(object.id)
      console.log('comment deleted successfully')
    }
  }

  const updateLike = (object) => {
      let deleteLike = false
      let id = null

      for (let i = 0; i < object.post.likes.length; i++) {
        const like = object.post.likes[i]
        if (like.owner == object.session.user && like.reference_name === object.post.id) {
          deleteLike = true
          id = like.id        
        }
      }

      let like_doc = createListResource({
          doctype: 'Comment',
          fields: ['reference_doctype', 'reference_name', 'comment_type', 'content'],
          auto: true,
          
          insert: {
            onSuccess(data) {
                console.log("Like created successfully:", data)
              },
            onError(error) {
              console.error("Error creating post:", error)
            }
          }
      })

      if (deleteLike) {
        like_doc.delete.submit(id)
      } else {
        // Inserting a new like
        like_doc.insert.submit({
          comment_type: 'Like',
          reference_doctype: 'Post',
          reference_name: object.post.id,
          content: 'Liked'
        })
      }
  }

  let posts = createResource({
    url: `http://127.0.0.1:8000/api/method/finsta.finsta.doctype.post.post.get_posts_with_likes_and_comments?user=${session.user}`,
    method: 'GET',
  })
  posts.fetch()


</script> 

<template>
    <MainLayout>
        <div class="pt-2 md:pt-6"></div>
        <div class="max-w-[880px] lg:ml-0 md:ml-[80px] md:pl-20 px-4 w-[100vw]">
            <div class="flex items-center justify-center">
                <label for="fileUser">
                    <img 
                        class="rounded-full object-fit md:w-[200px] w-[100px] cursor-pointer" 
                        :src="session.userImage"
                    >
                </label>
                <input 
                    id="fileUser" 
                    class="hidden" 
                    type="file" 
                    @input="$event => getUploadedImage($event)"
                >

                <div class="ml-6 w-full">
                    <div class="flex items-center md:mb-8 mb-5">
                        <div class="md:mr-6 mr-3 rounded-lg text-[22px]">{{ session.user }}</div>
                        <button class="md:block hidden md:mr-6 p-1 px-4 rounded-lg text-[16px] font-extrabold bg-gray-100 hover:bg-gray-200">
                            Edit Profile
                        </button>
                        <Cog :size="28" class="cursor-pointer" />
                    </div>
                    <button class="md:hidden mr-6 p-1 px-4 max-w-[260px] w-full rounded-lg text-[17px] font-extrabold bg-gray-100 hover:bg-gray-200">
                        Edit Profile
                    </button>
                    <div class="md:block hidden">
                        <div class="flex items-center text-[18px]">
                            <div class="mr-6">
                                <span class="font-extrabold">1</span> posts
                            </div>
                            <div class="mr-6">
                                <span class="font-extrabold">123</span> followers
                            </div>
                            <div class="mr-6">
                                <span class="font-extrabold">786</span> following
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="md:hidden">
            <div class="w-full flex items-center justify-around border-t border-t-gray-300 mt-8">
                <div class="text-center p-3">
                    <div class="font-extrabold">1</div>
                    <div class="text-gray-400 font-semibold -mt-1.5">posts</div>
                </div>
                <div class="text-center p-3">
                    <div class="font-extrabold">56</div>
                    <div class="text-gray-400 font-semibold -mt-1.5">followers</div>
                </div>
                <div class="text-center p-3">
                    <div class="font-extrabold">84</div>
                    <div class="text-gray-400 font-semibold -mt-1.5">following</div>
                </div>
            </div>

            <div class="w-full flex items-center justify-between border-t border-t-gray-300">
                <div class="p-3 w-1/4 flex justify-center border-t border-t-gray-900">
                    <Grid :size="28" fillColor="#0095F6" class="cursor-pointer"/>
                </div>
                <div class="p-3 w-1/4 flex justify-center">
                    <PlayBoxOutline :size="28" fillColor="#8E8E8E" class="cursor-pointer"/>
                </div>
                <div class="p-3 w-1/4 flex justify-center">
                    <BookmarkOutline :size="28" fillColor="#8E8E8E" class="cursor-pointer"/>
                </div>
                <div class="p-3 w-1/4 flex justify-center">
                    <AccountBoxOutline :size="28" fillColor="#8E8E8E" class="cursor-pointer"/>
                </div>
            </div>
        </div>

        <div id="ContentSection" class="md:pr-1.5 lg:pl-0 md:pl-[90px]">
            <div class="md:block mt-10 hidden border-t border-t-gray-300">
                <div class="flex items-center justify-between max-w-[600px] mx-auto font-extrabold text-gray-400 text-[15px]">
                    <div class="p-[17px] w-1/4 flex justify-center items-center border-t border-t-gray-900">
                        <Grid size="15" fillColor="#000000" class="cursor-pointer" />
                        <div class="ml-2 mb-[1px] text-gray-900">POSTS</div>
                    </div>
                    <div class="p-[17px] w-1/4 flex justify-center items-center">
                        <PlayBoxOutline size="15" fillColor="#8E8E8E" class="cursor-pointer" />
                        <div class="ml-2 mb-[1px] text-gray-900">REELS</div>
                    </div>
                    <div class="p-[17px] w-1/4 flex justify-center items-center">
                        <BookmarkOutline size="15" fillColor="#8E8E8E" class="cursor-pointer" />
                        <div class="ml-2 mb-[1px] text-gray-900">SAVED</div>
                    </div>
                    <div class="p-[17px] w-1/4 flex justify-center items-center">
                        <AccountBoxOutline size="15" fillColor="#8E8E8E" class="cursor-pointer" />
                        <div class="ml-2 mb-[1px] text-gray-900">TAGGED</div>
                    </div>
                </div>
            </div>

            <div class="grid md:gap-4 gap-1 grid-cols-3 relative">
                <div v-for="postByUser in posts.data" :key="postByUser">
                    <ContentOverlay
                        :postByUser="postByUser"
                        @selectedPost="data.post = $event"
                    />
                </div>
            </div>

            <div class="pb-20"></div>
        </div>
    </MainLayout>

    <ShowPostOverlay
        v-if="data.post"
        :post="data.post"
        @addComment="addComment($event)"
        @updateLike="updateLike($event)"
        @deleteSelected="deleteFunc($event)"
        @closeOverlay="data.post = null"
    />
  
</template>

<style>
.carousel_prev,
.carousel_next,
.carousel_prev:hover,
.carousel_next:hover {
    color: rgb(49, 49, 49);
    background-color: rgb(255, 255, 255);
    border-radius: 100%;
    margin: 0 20px;
}
</style>