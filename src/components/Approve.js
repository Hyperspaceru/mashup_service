import React, { useEffect, useState } from 'react';
import '../css/Approve.css';
import Pagination from './Pagination'
import Mashups from './Mashups'
import { useMemo } from 'react';

const MENU_STATE = { "WAIT": "Wait accept", "DENY": "Deny", "ACCEPT": "Accepted", "ERROR": "Errors", "DONE": "Uploaded" }

function Approve({ menuState, className, countHandler }) {
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [mashupList, setMashupList] = useState([])
    const [totalMashup, setTotalMashup] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        const fetchMeshaps = async () => {
            setLoading(true)
            let fetchUrl = ""
            switch (menuState) {
                case "DENY":
                    fetchUrl = 'mashup?type=deny&page=' + currentPage
                    break;
                case "ACCEPT":
                    fetchUrl = 'mashup?type=accept&page=' + currentPage
                    break;
                case "ERROR":
                    fetchUrl = 'mashup?type=error&page=' + currentPage
                    break;
                case "DONE":
                    fetchUrl = 'mashup?type=done&page=' + currentPage
                    break;
                case "WAIT":
                    fetchUrl = 'mashup?type=wait&page=' + currentPage
                    break;
                default:
                    fetchUrl = 'mashup?page=' + currentPage
            }
            const mashups = await fetch(fetchUrl)
                .then(res => res.json())
            if ('data' in mashups) {
                setMashupList('currentPage' in mashups.data ? mashups.data.currentPage : [])
                setTotalMashup('mashupCount' in mashups.data ? mashups.data.mashupCount : 0)
                setTotalPages('pageCount' in mashups.data ? mashups.data.pageCount : 0)
            } else {
                setMashupList([])
                setTotalMashup(0)
                setTotalPages(0)
            }
            setLoading(false)
        }
        fetchMeshaps()
    }, [currentPage, menuState])
    useMemo(()=>countHandler(totalMashup), [totalMashup,countHandler])
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const mashupListUpdate = (newMashup) => {
        const updatedMashupList = mashupList.map(mashup => {
            if (mashup.id === newMashup.id && mashup.publicId === newMashup.publicId) return newMashup
            return mashup
        });
        setMashupList(updatedMashupList)
    }
    const resetAllApprove = (value) => {
        const updatedMashupList = mashupList.map(mashup => {
            mashup.approve = value
            return mashup
        });
        setMashupList(updatedMashupList)
    }
    const sendForm = async () => {
        const response = await fetch('mashup', {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mashupList)
        })
        console.log(response)
    }
    return (
        <div className={"approve" + " " + className}>
            <h2 className="approve__header">{MENU_STATE[menuState]}</h2>
            <Mashups mashupList={mashupList} updateHook={mashupListUpdate} loading={loading}></Mashups>
            <div className="approve__controls">
                <div className="controls__pagination">
                    <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} loading={loading}></Pagination>
                </div>
                <div className="controls__buttons">
                    <button onClick={() => resetAllApprove(true)} className='button'><i class="fas fa-check button__icon"></i><span>Mark all</span></button>
                    <button onClick={() => resetAllApprove(false)} className='button approve__unmark'><i class="fas fa-times button__icon"></i><span>Unmark all</span></button>
                    <button onClick={() => sendForm()} className='button approve__accept'><i class="far fa-paper-plane button__icon"></i><span>Send</span></button>
                </div>
            </div>
        </div>
    );
}

export default Approve;