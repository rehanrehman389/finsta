<script setup>
    import { ref, reactive } from 'vue'
    import { router, usePage } from '@inertiajs/vue3'

    import { createListResource, createResource } from 'frappe-ui'

    import Close from 'vue-material-design-icons/Close.vue';
    import ArrowLeft from 'vue-material-design-icons/ArrowLeft.vue';
    import MapMarkerOutline from 'vue-material-design-icons/MapMarkerOutline.vue';
    import ChevronDown from 'vue-material-design-icons/ChevronDown.vue';

    // const user = usePage().props.auth.user

    const emit = defineEmits(['close'])

    const form = reactive({
        text: null,
        file: null,

    })

    let isValidFile = ref(null);
    let fileDisplay = ref('');
    let textarea = ref('');
    let error = ref({
        text: null,
        file: null,
    });

    const createPostFunc = async () => {
        error.value.text = null
        error.value.file = null

        const formData = new FormData()
        formData.append("file", form.file) // Append the file
        formData.append("file_name", form.file.name) // Append the file name
        formData.append("file_url", `/files/${form.file.name}`) // Set file URL (update based on your logic)

        try {
            const response = await fetch('http://127.0.0.1:8000/api/method/upload_file', {
                method: 'POST',
                headers: {
                    'Authorization': `token 73b6530029d4dea:eee2a9432d87585`,
                },
                body: formData,
            })

            const uploadResponse = await response.json()

            if (response.ok) {
                console.log('File uploaded successfully', uploadResponse)
            } else {
                console.error('Error uploading file', uploadResponse)
            }

            let post_doc = createListResource({
                doctype: 'Post',
                fields: ['file', 'user', 'text'],
                auto: true,

                insert: {
                    onSuccess(data) {
                        closeOverlay()
                        console.log("Post created successfully:", data)
                    },
                    onError(error) {
                        console.error("Error creating post:", error)
                    }
                }
            })

            // Inserting a new post with the uploaded file's URL
            post_doc.insert.submit({
                text: form.text,
                file: uploadResponse.message.file_url // Assuming uploadResponse contains the file URL
            })

        } catch (error) {
            console.error('Error during API call', error)
        }
    }

    const getUploadedImage = (e) => {
        form.file = e.target.files[0]
        let extension = form.file.name.substring(form.file.name.lastIndexOf('.') + 1);

        if (extension == 'jpg' || extension == 'png' || extension == 'jpeg') {
            isValidFile.value = true;
        } else {
            isValidFile.value = false;
            return
        }

        fileDisplay.value = URL.createObjectURL(e.target.files[0])
        setTimeout(() => {
            document.getElementById('TextAreaSection').scrollIntoView({behavior: 'smooth'});
        }, 300)
    }

    const closeOverlay = () => {
        form.text = null;
        form.file = null;
        fileDisplay.value = '';
        emit('close');
    };
</script>

<template>
    <div id="OverlaySection" class="fixed z-50 top-0 left-0 w-full h-screen bg-[#000000] bg-opacity-60 p-3">
        <button class="absolute right-3 cursor-pointer" @click="$event => closeOverlay()">
            <Close :size="27" fillColor="#FFFFFF"/>
        </button>

        <div class="max-w-6xl h-[calc(100%-100px)] mx-auto mt-10 bg-white rounded-xl">
            <div class="flex items-center justify-between w-full rounded-t-xl p-3 border-b-gray-300">
                <ArrowLeft :size="30" fillColor="#000000" @click="closeOverlay()"/>
                <div class="text-lg font-extrabold">New reel </div>
                <button @click="createPostFunc" class="text-lg text-blue-500 hover:text-gray-900 font-extrabold">
                    Share
                </button>
            </div>

            <div class="w-full md:flex h-[calc(100%-55px)] rounded-xl overflow-auto">
                <div class="flex items-center bg-gray-100 w-full overflow-hidden">
                    <div v-if="!fileDisplay" class="flex flex-col items-center mx-auto">
                        <label
                            for="file"
                            class="hover:bg-blue-700 bg-blue-500 rounded-lg p-2.5 text-white font-extrabold cursor-pointer"
                        >
                            Select From Computer
                        </label>
                        <input
                            id="file"
                            class="hidden"
                            type="file"
                            @input="$event => getUploadedImage($event)"
                        >
                        <div v-if="error && error.file" class="text-red-500 text-center p-2 font-extrabold">
                            {{ error.file }}
                        </div>
                        <div v-if="!fileDisplay && isValidFile === false" class="text-red-500 text-center p-2 font-extrabold">
                            File not accepted
                        </div>
                    </div>
                    <img v-if="fileDisplay && isValidFile === true" class="min-w-[400px] p-4 mx-auto" :src="fileDisplay">
                </div>

                <div id="TextAreaSection" class="max-w-[720px] w-full relative">
                    <div class="flex items-center justify-between p-3">
                        <div class="flex items-center">
                            <img class="rounded-full w-[38px] h-[38px]" src="https://picsum.photos/id/50/300/320">
                            <div class="ml-4 font-extrabold text-[15px]">Name Here</div>
                        </div>
                    </div>

                    <div v-if="error && error.text" class="text-red-500 p-2 font-extrabold">{{error.text}}</div>

                    <div class="flex w-full max-h-[200px] bg-white border-b">
                        <textarea
                            ref="textarea"
                            v-model="form.text"
                            placeholder="Write caption.."
                            rows="10"
                            class="
                                placeholder-gray-500
                                w-full
                                border-0
                                mt-2
                                mb-2
                                z-50
                                focus:ring-0
                                text-gray-500
                                text-[18px]
                            "
                        ></textarea>
                    </div>

                    <div class="flex items-center justify-between border-b p-3">
                        <div class="text-lg font-extrabold text-gray-500">Add location</div>
                        <MapMarkerOutline :size="27"/>
                    </div>

                    <div class="flex items-center justify-between border-b p-3">
                        <div class="text-lg font-extrabold text-gray-500">Accesibility</div>
                        <ChevronDown :size="27"/>
                    </div>

                    <div class="flex items-center justify-between border-b p-3">
                        <div class="text-lg font-extrabold text-gray-500">Advanced Settings</div>
                        <ChevronDown :size="27"/>
                    </div>

                    <div class="text-gray-500 mt-3 p-3 text-sm">
                        Your reel will be shared with your followers in their feeds and can be seen on your profile.
                        It may also appear in places such as Reels, where anyone can see it.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
