#! /usr/bin/env python3

import asyncio
from pyvirtualbench import PyVirtualBench, PyVirtualBenchException, FGenWaveformMode
from waveform import GaussianPulse
from websockets.server import serve
from numpy import array, savetxt, arange
import json
from matplotlib import pyplot as plt # Debug

def triggerWaveform(inputs):
    pulse = GaussianPulse(inputs['amplitude'], inputs['frecuency'], inputs['nSamples'], inputs['fs'], inputs['hgw'])

    pulseArray = array(pulse.y)
    sample_rate = 1/float(inputs['sampleRate']  )
    fgen.stop()
    fgen.configure_arbitrary_waveform(pulseArray.tolist(), sample_rate)#Sample rate 100S/s=>0.01 100000=>0.00001
    fgen.run()
    # t = pulse.t  # Debug
    # w = pulse.w
    # savetxt('test.txt', pulseArray) # Debug
    # pulse.getFFT() 
    # pulseFFT = pulse.y
    # plt.figure(1)
    # plt.subplot(211)
    # plt.plot(t, pulseArray, color="red") # Debug
    # plt.subplot(212)
    # plt.plot(w, pulseFFT, color="blue") # Debug
    # plt.show() # Debug
    
    # fgen.release()
# def stopFunctionGenerator():
#     fgen.stop()

def msoData():
    mso = virtualbench.acquire_mixed_signal_oscilloscope()

    mso.auto_setup()

    # sample_rate, acquisition_time, pretrigger_time, sampling_mode = mso.query_timing()
    # channels = mso.query_enabled_analog_channels()
    # channels_enabled, number_of_channels = virtualbench.collapse_channel_string(channels)

    mso.run()

    # Read the data by first querying how big the data needs to be, allocating the memory, and finally performing the read.
    analog_data = mso.read_analog_digital_u64()[0]
    print(analog_data)
    return analog_data

async def echo(websocket):
    async for message in websocket:
        msg = json.loads(message)
        print(msg)
        try:
        #    triggerWaveform(msg)
           fgen.stop()
           if msg['stop']:
               fgen.stop()
           await websocket.send(json.dumps({'data' : msoData()}))
        except PyVirtualBenchException as e:
            print("Error/Warning %d occurred\n%s" % (e.status, e))
        finally:
            virtualbench.release()
    

if __name__ == '__main__':
    global virtualbench, fgen
    virtualbench = PyVirtualBench('VB8012-3178C78')
    # msoData() # debug
    fgen = virtualbench.acquire_function_generator()
    async def main():
        print("Service Up....")
        async with serve(echo, "0.0.0.0", 1025):
            await asyncio.Future()  # run forever

    asyncio.run(main())

