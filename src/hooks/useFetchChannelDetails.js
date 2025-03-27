"use client"

import { useState, useEffect } from "react"
import axios from "axios"

// parseDateTime 함수를 직접 정의하여 사용
const parseDateTime = (dateTime) => {
    if (!dateTime) return "N/A" // Return N/A if null or undefined
    const dateString = dateTime.$date || dateTime // Check for nested $date
    const parsedDate = new Date(dateString)
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleString()
}

const useFetchChannelDetails = () => {
    const [channels, setChannels] = useState([])
    const [selectedChannelId, setSelectedChannelId] = useState(null)
    const [selectedDetails, setSelectedDetails] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchChannels()
    }, [])

    const fetchChannels = async () => {
        setLoading(true)
        try {
            const response = await axios.get("http://localhost:8080/channels/all")
            const formattedData = response.data.map((channel) => ({
                _id: channel._id, // MongoDB ObjectId
                id: channel.id, // 숫자형 ID - 이것을 API 요청에 사용해야 함 0321 현재 _id와 id를 구분하지 못함
                title: channel.title || channel.name, // title 필드 사용 (새로운 구조)
                name: channel.name || channel.title, // name 필드 사용 (이전 구조)
                username: channel.username, // username 필드 추가
                link: channel.link || "N/A", // link 필드
                updatedAt: parseDateTime(channel.updatedAt), // Parse date properly
            }))
            setChannels(formattedData)
            setError(null)
        } catch (err) {
            setError(`Error fetching channels: ${err.message}`)
            setChannels([])
        } finally {
            setLoading(false)
        }
    }

    // 채널 상세 정보를 가져오는 함수 수정
    const fetchDetailsByChannelId = async (mongoId) => {
        setLoading(true)
        try {
            // 선택된 채널 정보 찾기
            const selectedChannel = channels.find((channel) => channel._id === mongoId)

            if (!selectedChannel) {
                throw new Error("Selected channel not found")
            }

            // 중요: API 요청에는 숫자형 id를 사용해야 함
            const numericId = selectedChannel.id

            if (!numericId) {
                throw new Error("Channel does not have a numeric ID")
            }

            console.log(`Fetching details for channel: ${selectedChannel.title} (ID: ${numericId})`)

            // API 호출 시 숫자형 id 사용
            const response = await axios.get(`http://localhost:8080/chat/channel/${numericId}`)

            const formattedDetails = response.data.map((item) => ({
                msgUrl: item.url || item.msgUrl || "N/A", // url 또는 msgUrl 사용
                text: item.text || "No text available",
                image: item.media && item.media.url ? item.media.url : item.image, // 새로운 media 구조 또는 기존 image 사용
                mediaType: item.media && item.media.type ? item.media.type : null, // 미디어 타입 추가
                timestamp: parseDateTime(item.timestamp),
                sender: item.sender || null, // 새로운 sender 필드 추가
            }))

            setSelectedDetails(formattedDetails)
        } catch (err) {
            console.error("Error fetching channel details:", err)
            setError(`Error fetching channel details: ${err.message}`)
            setSelectedDetails([])
        } finally {
            setLoading(false)
        }
    }

    return {
        channels,
        selectedChannelId,
        selectedDetails,
        loading,
        error,
        fetchDetailsByChannelId,
    }
}

export default useFetchChannelDetails

