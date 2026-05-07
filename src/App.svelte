<script lang="ts">
  import { onMount } from 'svelte'
  import { Discord } from './lib/discord'

  let voiceStates = $state([])

  onMount(() => {
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
      voiceStates = detail.voice_states.filter(v => v.channel_id == hash[1]).map(v => ({
        ...v,
        member: detail.members.filter(m => m.user.id == v.user_id)[0],
      }))
    })
    d.start()
  })
</script>

{#each voiceStates as v}
<div>{v.member.user.username} {v.deaf?'sD':''}{v.mute?'sM':''}{v.self_deaf?'D':''}{v.self_mute?'M':''}{v.self_video?'V':''}{v.self_stream?'S':''}</div>
{/each}
