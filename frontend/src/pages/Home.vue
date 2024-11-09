<script setup>
  import { ref, onMounted, toRefs } from 'vue'
  import { Head, Link, router } from '@inertiajs/vue3'
  import MainLayout from '@/Layouts/MainLayout.vue';

  import 'vue3-carousel/dist/carousel.css'
  import { Carousel, Slide, Navigation } from 'vue3-carousel'

  import DotsHorizontal from 'vue-material-design-icons/DotsHorizontal.vue';
  import LikesSection from '../Components/LikesSection.vue';
  import ShowPostOverlay from '../Components/ShowPostOverlay.vue';

  import { createResource, createListResource } from 'frappe-ui'
  import { session } from '../data/session'

  let width = ref(window.innerWidth)
  let currentSlide = ref(0)
  let currentPost = ref(null)
  let openOverlay = ref(false)

  const props = defineProps({ posts: Object, allUsers: Object})
  // const { posts, allUsers } = toRefs(props)

  onMounted(() => {
    window.addEventListener('resize', () => {
      width.value = window.innerWidth
    })
  })

  const addComment = (object) => {
    let comment_doc = createListResource({
      doctype: 'Comment',
      fields: ['reference_doctype', 'reference_name', 'comment_type', 'content'],
      auto: true,
      
      insert: {
        onSuccess(data) {
            console.log("Post created successfully:", data)
            fetchPosts();
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

          delete: {
            onSuccess(data) {
                console.log("Like created successfully:", data)
                fetchPosts();
              },
            onError(error) {
              console.error("Error creating post:", error)
            }
          }
    })


    let delete_comment_doc = createListResource({
          doctype: 'Comment',
          fields: ['reference_doctype', 'reference_name', 'comment_type', 'content'],
          auto: true,

          delete: {
            onSuccess(data) {
                console.log("Like created successfully:", data)
                fetchPosts();
              },
            onError(error) {
              console.error("Error creating post:", error)
            }
          }
    })

    if (object.deleteType === 'Post') {
      delete_post_doc.delete.submit(object.id)
      console.log('post deleted successfully')
    } else {
      delete_comment_doc.delete.submit(object.id)
      console.log('comment deleted successfully')
    }

    if (object.deleteType === 'Post'){
      openOverlay.value = false
    }

    fetchPosts();
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
                fetchPosts();
              },
            onError(error) {
              console.error("Error creating post:", error)
            }
          },

          delete: {
            onSuccess(data) {
                console.log("Like created successfully:", data)
                fetchPosts();
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

  // let posts = createResource({
  //   url: 'http://127.0.0.1:8000/api/method/finsta.finsta.doctype.post.post.get_posts_with_likes_and_comments',
  //   method: 'GET',
  // })
  // posts.fetch()
  let posts = ref([]);  // Reactive posts array
  const fetchPosts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/method/finsta.finsta.doctype.post.post.get_posts_with_likes_and_comments');
      const data = await response.json();

      // Assuming `data.message` contains the array of posts
      if (data && data.message) {
        posts.value = data.message;  // Update posts with the data from the API
      } else {
        console.error("Invalid data structure:", data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  onMounted(() => {
    fetchPosts();  // Initial fetch of posts when component is mounted
  });


  let allUsers = createListResource({
    doctype: 'User',
    fields: ['name', 'username', 'user_image'],
    filters: [
      ['name', 'not in', ['Guest', 'Administrator']]
    ]
  })
  allUsers.fetch()
</script> 

<template>
  <MainLayout>
    <div class="mx-auto lg:pl-0 md:pl-[80px] pl-0">
      <Carousel
        v-model="currentSlide"
        class="max-w-[700px] mx-auto"
        :items-to-show="width >= 768 ? 8 : 6"
        :items-to-scroll="4"
        :wrap-around="true"
        :transition="500"
        snapAlign="start"
      >
      <slide v-for="slide in allUsers.data" :key="slide">
        <Link href="/" class="relative mx-auto text-center mt-4 px-2 cursor-pointer">
          <div class="absolute z-[-1] -top-[5px] left-[4px] rounded-full rotate-45 w-[64px] h-[64px] contrast-[1.3] bg-gradient-to-t from-yellow-300 to-purple-500 via-red-500">
            <div class="rounded-full ml-[3px] mt-[3px] w-[58px] h-[58px] bg-white" />
          </div>
          <img :src="slide.user_image" class="rounded-full w-[56px] -mt-[1px]">
          <div class="text-xs mt-2 w-[60px] truncate text-ellipsis overflow-hidden">{{ slide.username }}</div>
        </Link>
      </slide>

      <template #addons>
        <Navigation />
      </template>
      </Carousel>

      <div id="Posts" class="px-4 max-w-[600px] mx-auto mt-10" v-for="post in posts" :key="post.id">
        <div class="flex items-center justify-between py-2">
          <div class="flex items-center">
            <Link href="/" class="flex items-center">
              <img :src="post.user.user_image" class="rounded-full w-[38px] h-[38px]">
              <div class="ml-4 font-extrabold text-[15px]">{{ post.user.username }}</div>
            </Link>
            <div class="flex items-center text-[15px] text-gray-500">
              <span class="-mt-5 ml-2 mr-[5px] text-[35px]">.</span>
              <div>{{ post.created_at }}</div>
            </div>
          </div>

          <DotsHorizontal class="cursor-pointer" :size="27" />
        </div>

        <div class="bg-black rounded-lg w-full min-h-[400px] flex items-center">
          <img :src="post.file" class="max-auto w-full">
        </div>

        <LikesSection
          :post="post"
          @like="$event => updateLike($event)"
        />
        <div class="text-black font-extrabold py-1">{{ post.likes.length }} likes</div>
        <div>
          <span class="text-black font-extrabold">{{ post.user.username }}</span>
            {{ post.text }}
        </div>
        <button
          @click="currentPost = post; openOverlay = true"
          class="text-gray-500 font-extrabold py-1"
        >
          View all {{ post.comments.length }} comments
        </button>
      </div>

      <div class="pb-20"></div>
    </div>

  </MainLayout>

  <ShowPostOverlay
    v-if="openOverlay"
    :post="currentPost"
    @addComment="addComment($event)"
    @updateLike="updateLike($event)"
    @deleteSelected="deleteFunc($event)"
    @closeOverlay="openOverlay = false"
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