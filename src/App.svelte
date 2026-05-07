<script lang="ts">
  import { onMount } from 'svelte'
  import { Discord } from './lib/discord'
  import { format } from 'date-fns'
  import Icon from '@iconify/svelte'

  type Member = {
    user: {
      id: string
      username: string
      display_name: string
      avatar: string
    }
  }

  type VoiceState = {
    user_id: string
    channel_id: string
    deaf: boolean
    mute: boolean
    self_deaf: boolean
    self_mute: boolean
    self_video: boolean
    self_stream?: boolean
    member: Member
  }

  let now = $state<Date>()
  let voiceStates = $state<VoiceState[]>([])

  onMount(() => {
    setInterval(() => now = new Date, 100)
    const hash = window.location.hash.substring(1).split(',')
    const d = new Discord(hash[0])
    d.addEventListener('VOICE_STATE_UPDATE', ev => {
      const { detail } = ev as CustomEvent
      if (detail.channel_id == hash[1]) {
        voiceStates = voiceStates.filter(v => v.user_id != detail.user_id)
        voiceStates.push(detail)
      } else {
        voiceStates = voiceStates.filter(v => v.user_id != detail.user_id)
      }
    })
    d.addEventListener('GUILD_CREATE', ev =>  {
      const { detail } = ev as CustomEvent
      voiceStates = (detail.voice_states as VoiceState[]).filter(v => v.channel_id == hash[1]).map(v => ({
        ...v,
        member: (detail.members as Member[]).filter(m => m.user.id == v.user_id)[0],
      }))
    })
    d.start()
  })
</script>

<main>
  <div class="p-6 text-4xl font-mono font-bold flex items-center justify-between bg-base-200 sticky top-0">
    <div>{now && format(now, 'HH:mm')}</div>
    <div class="flex items-center gap-2">
      <Icon icon="lucide:user" width="44" height="44" />
      {voiceStates.length}
    </div>
  </div>
  <div class="p-8 flex flex-col gap-6">
    {#each voiceStates as v}
      <div class="flex items-center gap-6">
        <img src={`https://cdn.discordapp.com/avatars/${v.member.user.id}/${v.member.user.avatar}.webp`} alt={v.member.user.id} class="h-24 w-24 rounded-full" />
        <div class="break-all">
          <div class="text-5xl">{v.member.user.display_name || v.member.user.username}</div>
          <div class="text-2xl">@{v.member.user.username}</div>
        </div>
        <div class="grow flex justify-end gap-4">
          {#if v.deaf}
            <Icon icon="lucide:headphone-off" width="48" height="48" class="text-red-400" />
          {/if}
          {#if v.mute}
            <Icon icon="lucide:mic-off" width="48" height="48" class="text-red-400" />
          {/if}
          {#if v.self_deaf}
            <Icon icon="lucide:headphone-off" width="48" height="48" />
          {/if}
          {#if v.self_mute}
            <Icon icon="lucide:mic-off" width="48" height="48" />
          {/if}
          {#if v.self_video}
            <Icon icon="lucide:video" width="48" height="48" />
          {/if}
          {#if v.self_stream}
            <Icon icon="lucide:monitor" width="48" height="48" />
          {/if}
        </div>
      </div>
    {/each}
  </div>
</main>
