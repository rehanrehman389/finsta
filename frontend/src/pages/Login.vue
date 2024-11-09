<script lang="ts" setup>
import GuestLayout from '../Layouts/GuestLayout.vue';
import TextInput from '../Components/TextInput.vue';
import InputError from '../Components/InputError.vue';
import Button from '../Components/PrimaryButton.vue';
import { Link, useForm } from '@inertiajs/vue3';
import { session } from '../data/session';

defineProps({
    canResetPassword: Boolean, 
    status: String,
});

const form = useForm({
    email: '',
    password: '',
});

const submit = () => {
    session.login.submit({
        email: form.email,
        password: form.password,
    }, {
        onFinish: () => form.reset('password'),
    });
};
</script>

<template>
    <GuestLayout>
        <img class="mx-auto pt-8 pb-10" width="200" src="/insta-logo.png" />

        <form @submit.prevent="submit">
            <div>
                <TextInput
                    id="email"
                    name="email"
                    type="text"
                    class="mt-1 block w-full"
                    v-model="form.email"
                    required
                    autofocus
                    autocomplete="username"
                    placeholder="Email"
                />
                <InputError class="mt-2" :message="form.errors.email" />
            </div>

            <div class="mt-4">
                <TextInput
                    id="password"
                    name="password"
                    type="password"
                    class="mt-1 block w-full"
                    v-model="form.password"
                    required
                    autocomplete="current-password"
                    placeholder="Password"
                />
                <InputError class="mt-2" :message="form.errors.password" />
            </div>

            <Button :loading="session.login.loading" variant="solid">Login</Button>

            <div class="flex items-center justify-center mt-4">
                <Link
                    v-if="canResetPassword"
                    :href="route('password.request')"
                    class="text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Forgot your password?
                </Link>
            </div>

            <div class="flex items-center justify-center mt-4">
                Don't have an account?
                <Link
                    v-if="canResetPassword"
                    :href="route('register')"
                    class="pl-1 font-bold text-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Sign up
                </Link>
            </div>
        </form>
    </GuestLayout>
</template>